/* 共享导航条 — 康庄研究院情报站
 * 用法：在 </body> 前引入 <script src="assets/navbar.js"></script>
 * 行为：
 *   1) 页面已有 .sidebar  → 重建为嵌套 nav-btn（财经新闻总结为父，期货收盘/股票打分为子），并按 URL 修正 "on" 高亮
 *   2) 页面没有 .sidebar  → 注入一个置顶水平导航条（含嵌套子栏目），不破坏原有布局
 */
(function(){
  'use strict';
  // 导航项（href 用站点根相对，便于子目录 /reports/、/futures/、/scores/ 也能用）
  // 层级：康庄大厅 / 财经新闻总结（父）→ 期货收盘 · 股票打分（子）
  var SITE_ROOT = '/';
  var items = [
    {key:'index', text:'康庄大厅', href:SITE_ROOT+'index.html'},
    {key:'news',  text:'财经新闻总结', href:SITE_ROOT+'news.html', children:[
      {key:'futures', text:'期货收盘', href:SITE_ROOT+'futures.html'},
      {key:'scores',  text:'股票打分', href:SITE_ROOT+'scores/index.html'}
    ]}
  ];
  // 依据当前 URL 决定哪个 key 高亮
  var path = location.pathname.replace(/\/+$/,'/');
  function activeKey(){
    if (/\/news(\.html)?$/.test(path)) return 'news';
    if (/\/futures(\.html)?$/.test(path) || /\/futures\//.test(path)) return 'futures';
    if (/\/scores(\.html)?$/.test(path) || /\/scores\//.test(path)) return 'scores';
    return 'index';
  }
  var ACTIVE = activeKey();

  // —— 判断某 nav 项是否高亮（父项在任一子项激活时也高亮）——
  function isOn(it){
    if (it.key === ACTIVE) return true;
    if (it.children) return it.children.some(function(c){ return c.key === ACTIVE; });
    return false;
  }
  // 生成单个按钮 HTML（sub=true 表示子栏目，缩进显示）
  function btnHTML(it, sub){
    var cls = 'nav-btn' + (sub ? ' sub' : '') + (isOn(it) ? ' on' : '');
    return '<a class="'+cls+'" href="'+it.href+'">'+it.text+'</a>';
  }
  // 展开父子结构（父在前，子项紧跟其后缩进）
  function renderBtns(){
    var out = [];
    items.forEach(function(it){
      out.push(btnHTML(it, false));
      (it.children || []).forEach(function(c){ out.push(btnHTML(c, true)); });
    });
    return out.join('');
  }
  // —— 工具：构造 sidebar <aside> HTML（含嵌套子栏目 + brand）——
  function sidebarHTML(){
    return '<aside class="sidebar nb-injected"><div class="brand">'+
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>康庄研究院</div>'+
      '<div class="nav-sep"></div>'+renderBtns()+'</aside>';
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
    '.sidebar.nb-injected .nav-btn.sub{margin-left:16px;font-size:13px;padding:8px 12px;border-left:2px solid rgba(255,255,255,.22)}'+
    '.nb-nav-btn.sub{margin-left:10px;font-size:13px;opacity:.92}'+
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

  // —— 模式 1：页面已有 sidebar（.nav-btn） → 重建为嵌套结构 & 修正 "on" 高亮 —— 
  function patchExistingSidebar(){
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return false;
    // 移除原有 nav-btn / nav-btn sub，避免重复
    sidebar.querySelectorAll('.nav-btn').forEach(function(el){ el.parentNode.removeChild(el); });
    // 确保有 .nav-sep；没有则补一个
    if (!sidebar.querySelector('.nav-sep')){
      var sep = document.createElement('div');
      sep.className = 'nav-sep';
      sidebar.appendChild(sep);
    }
    // 按 items 嵌套结构重建按钮（父在前、子项后置缩进）
    var frag = document.createDocumentFragment();
    items.forEach(function(it){
      var a = document.createElement('a');
      a.className = 'nav-btn' + (isOn(it) ? ' on' : '');
      a.href = it.href; a.textContent = it.text;
      frag.appendChild(a);
      (it.children || []).forEach(function(c){
        var b = document.createElement('a');
        b.className = 'nav-btn sub' + (isOn(c) ? ' on' : '');
        b.href = c.href; b.textContent = c.text;
        frag.appendChild(b);
      });
    });
    var sep = sidebar.querySelector('.nav-sep');
    sep.parentNode.insertBefore(frag, sep.nextSibling);
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
    // 复用嵌套渲染（父 + 子），再把 class 换成水平条样式 .nb-nav-btn
    var btns = renderBtns().replace(/class="nav-btn/g, 'class="nb-nav-btn');
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
