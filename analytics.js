
(function() {
    // 1. Kiểm tra đối tượng window.env
    const env = window.env || {};
    
    // 2. Nạp Google Analytics (gtag.js)
    const gaId = env.GOOGLE_ANALYTICS_ID;
    if (gaId && gaId.startsWith('G-')) {
        // Thêm thẻ script chính thức
        const scriptSrc = document.createElement('script');
        scriptSrc.async = true;
        scriptSrc.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(scriptSrc);

        // Định nghĩa hàm gtag & gửi pageview
        const scriptInit = document.createElement('script');
        scriptInit.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
        `;
        document.head.appendChild(scriptInit);
        console.log(`Locafy: Google Analytics (${gaId}) đã được nạp.`);
    } else {
        console.warn('Locafy: Google Analytics ID trống hoặc không đúng định dạng G-XXXX.');
    }

    // 3. Tự động kiểm tra và chèn thẻ meta Google Search Console (chỉ áp dụng ở Trang Chủ)
    const gscId = env.GOOGLE_SITE_VERIFICATION;
    const path = window.location.pathname;
    const isHomePage = path === '/' || path === '/index' || path.endsWith('index.html') || path === '';
                       
    if (gscId && isHomePage) {
        let metaTag = document.querySelector('meta[name="google-site-verification"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'google-site-verification';
            metaTag.content = gscId;
            document.head.appendChild(metaTag);
            console.log('Locafy: Thẻ meta xác minh Google Search Console đã được chèn.');
        } else {
            metaTag.content = gscId; 
        }
    }
})();
