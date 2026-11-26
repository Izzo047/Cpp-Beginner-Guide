using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Windows.Forms;

internal static class FieldnotesLauncher
{
    private const int Port = 8765;
    private const string MutexName = "Local\\FieldnotesCppLearningStudio";

    [STAThread]
    private static void Main()
    {
        bool ownsMutex;
        using (Mutex mutex = new Mutex(true, MutexName, out ownsMutex))
        {
            if (!ownsMutex)
            {
                MessageBox.Show(
                    "Fieldnotes is already open.",
                    "Fieldnotes",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
                return;
            }

            LocalSiteServer server = null;
            try
            {
                string root = AppDomain.CurrentDomain.BaseDirectory;
                string indexPath = Path.Combine(root, "index.html");
                string lessonsPath = Path.Combine(root, "lessons", "01-foundations.md");
                if (!File.Exists(indexPath) || !File.Exists(lessonsPath))
                {
                    throw new FileNotFoundException(
                        "The learning site files were not found beside Fieldnotes.exe. " +
                        "Keep the executable in the Cpp-Beginner-Guide folder.");
                }

                string edgePath = FindEdge();
                if (edgePath == null)
                {
                    throw new FileNotFoundException(
                        "Microsoft Edge was not found. Install or repair Microsoft Edge, then try again.");
                }

                server = new LocalSiteServer(root, Port);
                server.Start();

                string profile = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "FieldnotesCppLearningStudio",
                    "BrowserProfile");
                Directory.CreateDirectory(profile);

                string address = "http://127.0.0.1:" + Port + "/";
                ProcessStartInfo startInfo = new ProcessStartInfo();
                startInfo.FileName = edgePath;
                startInfo.Arguments =
                    "--app=" + Quote(address) +
                    " --user-data-dir=" + Quote(profile) +
                    " --no-first-run --no-default-browser-check --disable-background-mode";
                startInfo.WorkingDirectory = root;
                startInfo.UseShellExecute = false;

                using (Process browser = Process.Start(startInfo))
                {
                    if (browser == null)
                    {
                        throw new InvalidOperationException("Microsoft Edge could not be started.");
                    }
                    browser.WaitForExit();
                }
            }
            catch (Exception error)
            {
                MessageBox.Show(
                    "Fieldnotes could not start.\n\n" + error.Message,
                    "Fieldnotes — startup error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }
            finally
            {
                if (server != null)
                {
                    server.Dispose();
                }
                mutex.ReleaseMutex();
            }
        }
    }

    private static string FindEdge()
    {
        string programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
        string programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        string[] candidates = new string[]
        {
            Path.Combine(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
            Path.Combine(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
            Path.Combine(localAppData, "Microsoft", "Edge", "Application", "msedge.exe")
        };

        foreach (string candidate in candidates)
        {
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }
        return null;
    }

    private static string Quote(string value)
    {
        return "\"" + value.Replace("\"", "\\\"") + "\"";
    }

    private sealed class LocalSiteServer : IDisposable
    {
        private readonly string _root;
        private readonly string _rootPrefix;
        private readonly TcpListener _listener;
        private readonly int _port;
        private volatile bool _stopping;

        public LocalSiteServer(string root, int port)
        {
            _root = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            _rootPrefix = _root + Path.DirectorySeparatorChar;
            _port = port;
            _listener = new TcpListener(IPAddress.Loopback, port);
        }

        public void Start()
        {
            _listener.Start(16);
            Thread acceptThread = new Thread(AcceptClients);
            acceptThread.IsBackground = true;
            acceptThread.Name = "Fieldnotes local site";
            acceptThread.Start();
        }

        public void Dispose()
        {
            _stopping = true;
            _listener.Stop();
        }

        private void AcceptClients()
        {
            while (!_stopping)
            {
                TcpClient client;
                try
                {
                    client = _listener.AcceptTcpClient();
                }
                catch (SocketException)
                {
                    if (_stopping)
                    {
                        return;
                    }
                    continue;
                }
                catch (ObjectDisposedException)
                {
                    return;
                }

                ThreadPool.QueueUserWorkItem(HandleClient, client);
            }
        }

        private void HandleClient(object state)
        {
            using (TcpClient client = (TcpClient)state)
            {
                client.ReceiveTimeout = 5000;
                client.SendTimeout = 5000;
                NetworkStream stream = null;
                try
                {
                    stream = client.GetStream();
                    using (StreamReader reader = new StreamReader(stream, Encoding.ASCII, false, 1024, true))
                    {
                        string requestLine = reader.ReadLine();
                        if (String.IsNullOrEmpty(requestLine))
                        {
                            return;
                        }

                        int headerLength = requestLine.Length;
                        string hostHeader = null;
                        string originHeader = null;
                        string fetchSiteHeader = null;
                        string header;
                        while (!String.IsNullOrEmpty(header = reader.ReadLine()))
                        {
                            headerLength += header.Length;
                            if (headerLength > 32768)
                            {
                                WriteResponse(stream, 431, "Request Header Fields Too Large", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Request headers are too large."));
                                return;
                            }

                            int separator = header.IndexOf(':');
                            if (separator <= 0)
                            {
                                continue;
                            }
                            string name = header.Substring(0, separator).Trim();
                            string value = header.Substring(separator + 1).Trim();
                            if (String.Equals(name, "Host", StringComparison.OrdinalIgnoreCase))
                            {
                                hostHeader = value;
                            }
                            else if (String.Equals(name, "Origin", StringComparison.OrdinalIgnoreCase))
                            {
                                originHeader = value;
                            }
                            else if (String.Equals(name, "Sec-Fetch-Site", StringComparison.OrdinalIgnoreCase))
                            {
                                fetchSiteHeader = value;
                            }
                        }

                        string[] requestParts = requestLine.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                        if (requestParts.Length != 3 ||
                            (requestParts[2] != "HTTP/1.0" && requestParts[2] != "HTTP/1.1") ||
                            !requestParts[1].StartsWith("/", StringComparison.Ordinal))
                        {
                            WriteResponse(stream, 400, "Bad Request", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Invalid request."));
                            return;
                        }

                        if (!IsAllowedHost(hostHeader) ||
                            !IsAllowedOrigin(originHeader) ||
                            String.Equals(fetchSiteHeader, "cross-site", StringComparison.OrdinalIgnoreCase))
                        {
                            WriteResponse(stream, 403, "Forbidden", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Cross-origin requests are not allowed."));
                            return;
                        }

                        string method = requestParts[0].ToUpperInvariant();
                        if (method != "GET" && method != "HEAD")
                        {
                            WriteResponse(stream, 405, "Method Not Allowed", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Only GET and HEAD are supported."), "Allow: GET, HEAD\r\n");
                            return;
                        }

                        string rawPath = requestParts[1].Split('?')[0];
                        string decodedPath = Uri.UnescapeDataString(rawPath);
                        if (decodedPath == "/")
                        {
                            decodedPath = "/index.html";
                        }

                        string relativePath = decodedPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                        string[] pathSegments = relativePath.Split(Path.DirectorySeparatorChar);
                        for (int index = 0; index < pathSegments.Length; index++)
                        {
                            if (pathSegments[index].StartsWith(".", StringComparison.Ordinal))
                            {
                                WriteResponse(stream, 403, "Forbidden", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Hidden files are not served."));
                                return;
                            }
                        }

                        string filePath = Path.GetFullPath(Path.Combine(_root, relativePath));
                        if (!filePath.StartsWith(_rootPrefix, StringComparison.OrdinalIgnoreCase))
                        {
                            WriteResponse(stream, 403, "Forbidden", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Path is outside the learning folder."));
                            return;
                        }
                        if (!IsAllowedFileType(filePath))
                        {
                            WriteResponse(stream, 403, "Forbidden", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("This file type is not served."));
                            return;
                        }
                        if (!File.Exists(filePath))
                        {
                            WriteResponse(stream, 404, "Not Found", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("The requested learning file was not found."));
                            return;
                        }

                        byte[] content = File.ReadAllBytes(filePath);
                        WriteResponse(stream, 200, "OK", ContentType(filePath), content, null, method != "HEAD");
                    }
                }
                catch (IOException)
                {
                    // A browser may close a connection while the response is being written.
                }
                catch (Exception error)
                {
                    if (stream != null)
                    {
                        try
                        {
                            byte[] message = Encoding.UTF8.GetBytes("Local site error: " + error.Message);
                            WriteResponse(stream, 500, "Internal Server Error", "text/plain; charset=utf-8", message);
                        }
                        catch (IOException)
                        {
                            // The requesting browser has already disconnected.
                        }
                    }
                }
            }
        }

        private bool IsAllowedHost(string host)
        {
            string loopbackHost = "127.0.0.1:" + _port;
            string localHost = "localhost:" + _port;
            return String.Equals(host, loopbackHost, StringComparison.OrdinalIgnoreCase) ||
                String.Equals(host, localHost, StringComparison.OrdinalIgnoreCase);
        }

        private bool IsAllowedOrigin(string origin)
        {
            if (String.IsNullOrEmpty(origin))
            {
                return true;
            }
            return String.Equals(origin, "http://127.0.0.1:" + _port, StringComparison.OrdinalIgnoreCase) ||
                String.Equals(origin, "http://localhost:" + _port, StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsAllowedFileType(string filePath)
        {
            string extension = Path.GetExtension(filePath).ToLowerInvariant();
            return extension == ".html" ||
                extension == ".css" ||
                extension == ".js" ||
                extension == ".md" ||
                extension == ".cpp" ||
                extension == ".py" ||
                extension == ".svg" ||
                extension == ".ico";
        }

        private static string ContentType(string filePath)
        {
            switch (Path.GetExtension(filePath).ToLowerInvariant())
            {
                case ".html": return "text/html; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".md": return "text/markdown; charset=utf-8";
                case ".cpp": return "text/plain; charset=utf-8";
                case ".py": return "text/plain; charset=utf-8";
                case ".svg": return "image/svg+xml";
                case ".ico": return "image/x-icon";
                default: return "application/octet-stream";
            }
        }

        private static void WriteResponse(
            NetworkStream stream,
            int statusCode,
            string statusText,
            string contentType,
            byte[] content,
            string additionalHeaders = null,
            bool includeBody = true)
        {
            string headers =
                "HTTP/1.1 " + statusCode + " " + statusText + "\r\n" +
                "Content-Type: " + contentType + "\r\n" +
                "Content-Length: " + content.Length + "\r\n" +
                "Cache-Control: no-store\r\n" +
                "X-Content-Type-Options: nosniff\r\n" +
                "X-Frame-Options: DENY\r\n" +
                "Referrer-Policy: no-referrer\r\n" +
                "Cross-Origin-Resource-Policy: same-origin\r\n" +
                "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()\r\n" +
                "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src 'none'\r\n" +
                (additionalHeaders ?? String.Empty) +
                "Connection: close\r\n\r\n";
            byte[] headerBytes = Encoding.ASCII.GetBytes(headers);
            stream.Write(headerBytes, 0, headerBytes.Length);
            if (includeBody && content.Length > 0)
            {
                stream.Write(content, 0, content.Length);
            }
        }
    }
}
