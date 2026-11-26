package com.izzo047.fieldnotes;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.RequiresApi;
import androidx.webkit.WebViewAssetLoader;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public final class MainActivity extends ComponentActivity {
    private static final String ASSET_HOST = "appassets.androidplatform.net";
    private static final String START_URL =
            "https://" + ASSET_HOST + "/assets/index.html";

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13, 17, 23));
        getWindow().setNavigationBarColor(Color.rgb(13, 17, 23));

        createCourseWebView();
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });
        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(START_URL);
        }
    }

    private void createCourseWebView() {
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(13, 17, 23));
        FrameLayout appContainer = new FrameLayout(this);
        appContainer.setBackgroundColor(Color.rgb(13, 17, 23));
        appContainer.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(appContainer);
        applySystemBarInsets(appContainer);
        WebView.setWebContentsDebuggingEnabled(false);
        configureWebView();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        // The bundled course UI needs JavaScript; only packaged same-origin assets can run.
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setBlockNetworkLoads(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setGeolocationEnabled(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view,
                    WebResourceRequest request) {
                WebResourceResponse localResponse =
                        assetLoader.shouldInterceptRequest(request.getUrl());
                return localResponse != null ? localResponse : blockedResponse();
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view,
                    WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isCourseAsset(uri)) {
                    return false;
                }
                if ("https".equalsIgnoreCase(uri.getScheme())
                        && uri.getHost() != null
                        && uri.getUserInfo() == null) {
                    openExternalLink(uri);
                } else {
                    Toast.makeText(
                            MainActivity.this,
                            R.string.blocked_link,
                            Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @RequiresApi(Build.VERSION_CODES.O)
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (view != webView) {
                    return false;
                }
                ViewParent parent = view.getParent();
                if (parent instanceof ViewGroup) {
                    ((ViewGroup) parent).removeView(view);
                }
                view.stopLoading();
                view.setWebViewClient(null);
                view.destroy();
                webView = null;
                createCourseWebView();
                webView.loadUrl(START_URL);
                Toast.makeText(
                        MainActivity.this,
                        R.string.webview_restarted,
                        Toast.LENGTH_SHORT).show();
                return true;
            }
        });
    }

    private boolean isCourseAsset(Uri uri) {
        return "https".equalsIgnoreCase(uri.getScheme())
                && ASSET_HOST.equalsIgnoreCase(uri.getHost())
                && uri.getPath() != null
                && uri.getPath().startsWith("/assets/");
    }

    private void openExternalLink(Uri uri) {
        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException error) {
            Toast.makeText(this, R.string.no_browser, Toast.LENGTH_SHORT).show();
        }
    }

    private WebResourceResponse blockedResponse() {
        return new WebResourceResponse(
                "text/plain",
                "UTF-8",
                403,
                "Blocked",
                Collections.singletonMap("Cache-Control", "no-store"),
                new ByteArrayInputStream(
                        "Network and non-course resources are blocked.".getBytes(StandardCharsets.UTF_8)));
    }

    private void applySystemBarInsets(View view) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            Window window = getWindow();
            window.setDecorFitsSystemWindows(false);
            window.setStatusBarColor(Color.TRANSPARENT);
            window.setNavigationBarColor(Color.TRANSPARENT);
            view.setOnApplyWindowInsetsListener((target, insets) -> {
                int safeAreaTypes = WindowInsets.Type.systemBars()
                        | WindowInsets.Type.displayCutout();
                Insets safeArea = insets.getInsets(safeAreaTypes);
                target.setPadding(
                        safeArea.left,
                        safeArea.top,
                        safeArea.right,
                        safeArea.bottom);
                return new WindowInsets.Builder(insets)
                        .setInsets(safeAreaTypes, Insets.NONE)
                        .build();
            });
            view.requestApplyInsets();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) {
            webView.saveState(outState);
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.setWebViewClient(null);
            webView.removeAllViews();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
