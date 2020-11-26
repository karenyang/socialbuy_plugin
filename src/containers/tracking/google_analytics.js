// export function InitializeTrackingOnPage(pageview) {
//     (function (i, s, o, g, r, a, m) {
//         i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
//             (i[r].q = i[r].q || []).push(arguments)
//         }, i[r].l = 1 * new Date(); a = s.createElement(o),
//             m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
//     })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
//     ga('create', 'UA-184044017-1', 'auto');
//     ga('set', 'checkProtocolTask', null);
//     ga('send', 'pageview', pageview);
// }

export function trackButtonClick(name) {
    ga('send', 'event', "UIButton", 'Click', name);
    console.log("clicked: ", name);
};



// module.exports = {
//     InitializeTrackingOnPage: InitializeTrackingOnPage,
//     trackButtonClick: trackButtonClick,
// };
