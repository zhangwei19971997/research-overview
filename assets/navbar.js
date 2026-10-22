/* 共享导航条 — 康庄研究院
 * 用法：在 </body> 前引入 <script src="assets/navbar.js"></script>
 * 行为：
 *   1) 页面已有 .sidebar  → 按 NAV_ITEMS 重建 nav-btn，并按当前 URL 修正 "on" 高亮
 *   2) 页面有 .layout 但无 .sidebar → 注入一个左侧 sidebar
 *   3) 页面没有 .layout 也没有 .sidebar → 注入一个置顶水平 topbar
 *
 * 重要：站点部署在 GitHub Pages 子路径（如 /research-overview/），SITE_ROOT 必须运行时推导，
 * 不能写死 "/"，否则子目录下的链接全部 404。
 *
 * 栏目必须与 site_skin.NAV_ITEMS 保持同步（康庄大厅/江湖传闻/期货收盘/江湖龙虎榜/组合圆桌/技术面判断）。
 */
(function(){
  'use strict';

  // 6 个导航项（与 site_skin.NAV_ITEMS 一致）。href 仅写相对站点根的文件名，
  // 实际链接由 getSiteRoot() 拼出，兼容子路径部署。
  var items = [
    {key:'index',      text:'康庄大厅',   href:'index.html'},
    {key:'news',       text:'江湖传闻',   href:'news.html'},
    {key:'futures',    text:'期货收盘',   href:'futures.html'},
    {key:'scores',     text:'江湖龙虎榜', href:'scores/index.html'},
    {key:'roundtable', text:'组合圆桌',   href:'roundtable.html'},
    {key:'techjudge',  text:'技术面判断', href:'techjudge.html'}
  ];

  // 站点根目录：运行时推导，兼容 GitHub Pages 子路径部署
  function getSiteRoot(){
    var p = location.pathname;
    // 已知落在站点根目录的文件名 / 子目录：命中其一即回退到其所在目录
    var markers = ['scores/','assets/','index.html','news.html','futures.html','techjudge.html','roundtable.html'];
    for (var i=0;i<markers.length;i++){
      var m = p.indexOf(markers[i]);
      if (m !== -1) return p.slice(0, m);
    }
    // 兜底：无上述标记（如直接访问 /repo/ 目录、或本地根）
    if (p.charAt(p.length-1) === '/') return p;
    return p.slice(0, p.lastIndexOf('/')+1);
  }
  var SITE_ROOT = getSiteRoot();

  // 依据当前 URL 决定哪个 key 高亮
  var path = location.pathname.replace(/\/+$/,'/');
  function activeKey(){
    if (/\/news(\.html)?$/.test(path)) return 'news';
    if (/\/futures(\.html)?$/.test(path) || /\/futures\//.test(path)) return 'futures';
    if (/\/scores(\.html)?$/.test(path) || /\/scores\//.test(path)) return 'scores';
    if (/\/roundtable(\.html)?$/.test(path)) return 'roundtable';
    if (/\/techjudge(\.html)?$/.test(path)) return 'techjudge';
    return 'index';
  }
  var ACTIVE = activeKey();

  // —— 工具：构造 sidebar <aside> HTML（6 链接 + brand）——
  function sidebarHTML(){
    var btns = items.map(function(it){
      var cls = 'nav-btn' + (it.key===ACTIVE ? ' on' : '');
      return '<a class="'+cls+'" href="'+SITE_ROOT+it.href+'">'+it.text+'</a>';
    }).join('');
    return '<aside class="sidebar nb-injected"><div class="brand">'+
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>康庄研究院</div>'+
      '<div class="nav-sep"></div>'+btns+'</aside>';
  }

  // —— 工具：sidebar 所需的 CSS（重复声明去重浏览器会自动合并）——
  var SIDEBAR_CSS =
    '.sidebar.nb-injected{position:sticky;top:0;align-self:flex-start;width:232px;flex:none;height:100vh;'+
    'background:#12325b;color:#fff;padding:22px 16px;display:flex;flex-direction:column;gap:4px;'+
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Roboto,sans-serif}'+
    '.sidebar.nb-injected .brand{font-weight:700;font-size:16px;display:flex;align-items:center;gap:8px;margin-bottom:18px;line-height:1.3}'+
    '.sidebar.nb-injected .brand svg{flex:none}'+
    '.sidebar.nb-injected .nav-sep{height:1px;background:rgba(255,255,255,.14);margin:4px 2px 12px}'+
    '.nb-nav-btn{padding:10px 14px;border-radius:10px;font-size:14px;color:#dbe6f3;min-height:40px;'+
    'display:flex;align-items:center;transition:background .15s,color .15s;text-decoration:none}'+
    '.nb-nav-btn:hover{background:rgba(255,255,255,.12);color:#fff}'+
    '.nb-nav-btn.on{background:#1e88e5;color:#fff;font-weight:600}'+
    // 置顶水平导航条（用于没有 .layout 结构的页面）
    '.nb-topbar{position:sticky;top:0;z-index:999;background:#12325b;color:#fff;padding:10px 18px;'+
    'display:flex;align-items:center;gap:8px;flex-wrap:wrap;'+
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Roboto,sans-serif;'+
    'box-shadow:0 2px 8px rgba(0,0,0,.15)}'+
    '.nb-topbar .nb-brand{font-weight:700;font-size:15px;display:flex;align-items:center;gap:6px;margin-right:14px}'+
    '.nb-topbar .nb-brand svg{flex:none}'+
    '.nb-topbar .nb-sep{width:1px;height:22px;background:rgba(255,255,255,.18);margin:0 4px}'+
    '@media(max-width:768px){.sidebar.nb-injected{position:static;width:auto;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;padding:12px 14px;gap:8px}'+
    '.sidebar.nb-injected .brand{margin-bottom:0;margin-right:auto}'+
    '.sidebar.nb-injected .nav-sep{display:none}'+
    '.nb-topbar{padding:8px 12px;gap:6px}.nb-topbar .nb-brand{margin-right:8px;font-size:14px}}';

  function injectCSS(){
    if (document.getElementById('nb-style')) return;
    var s = document.createElement('style');
    s.id = 'nb-style';
    s.textContent = SIDEBAR_CSS;
    document.head.appendChild(s);
  }

  // —— 模式 1：页面已有 sidebar（.nav-btn） → 按 NAV_ITEMS 重建 & "on" 高亮 ——
  function patchExistingSidebar(){
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return false;
    // 移除原有 nav-btn，避免重复
    var existing = sidebar.querySelectorAll('.nav-btn');
    existing.forEach(function(el){ el.parentNode.removeChild(el); });
    // 确保有 .nav-sep；没有则补一个
    if (!sidebar.querySelector('.nav-sep')){
      var sep = document.createElement('div');
      sep.className = 'nav-sep';
      sidebar.appendChild(sep);
    }
    // 注入 6 个按钮
    var sep = sidebar.querySelector('.nav-sep');
    items.forEach(function(it){
      var a = document.createElement('a');
      a.className = 'nav-btn' + (it.key===ACTIVE ? ' on' : '');
      a.href = SITE_ROOT + it.href;
      a.textContent = it.text;
      sep.parentNode.insertBefore(a, sep.nextSibling);
    });
    // 按 NAV_ITEMS 顺序重排
    var btnEls = Array.from(sidebar.querySelectorAll('.nav-btn'));
    btnEls.sort(function(a,b){
      return items.findIndex(function(i){return a.textContent===i.text;}) -
             items.findIndex(function(i){return b.textContent===i.text;});
    });
    btnEls.forEach(function(el){ sidebar.appendChild(el); });
    return true;
  }

  // —— 模式 2：页面有 .layout 但没有 sidebar（兜底，在 .layout 起始处插一个）——
  function injectSidebarIntoLayout(){
    var layout = document.querySelector('.layout');
    if (!layout) return false;
    injectCSS();
    // 在 .layout 最前面插入 sidebar
    layout.insertAdjacentHTML('afterbegin', sidebarHTML());
    return true;
  }

  // —— 模式 3：页面没有 .layout 也没有 .sidebar → 注入置顶水平 topbar ——
  function injectTopbar(){
    injectCSS();
    var btns = items.map(function(it){
      var cls = 'nb-nav-btn' + (it.key===ACTIVE ? ' on' : '');
      return '<a class="'+cls+'" href="'+SITE_ROOT+it.href+'">'+it.text+'</a>';
    }).join('');
    var html = '<nav class="nb-topbar"><span class="nb-brand">'+
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>康庄研究院</span>'+
      '<span class="nb-sep"></span>'+btns+'</nav>';
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  // —— 主流程：依次尝试 3 种模式 ——
  function run(){
    if (patchExistingSidebar()) return;     // 模式 1：修补已有 sidebar
    if (injectSidebarIntoLayout()) return;   // 模式 2：在 .layout 注入 sidebar
    injectTopbar();                          // 模式 3：兜底，注入 topbar
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
