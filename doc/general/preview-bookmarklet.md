# Generate Preview Bookmarklet

<div id="form">
<label for="giturl">Repository URL:</label><br>
<input id="giturl" placeholder="https://github.com/...." size="40"><br>
<br>
<label for="prefix">Fixed Hostname(optional): </label><br>
<input id="prefix"><br>
<br>
<input type="hidden" id="title"><br>
<br>
<button onclick="run()">Generate Bookmarklet</button>
<br>
<br>
</div>

<div id="book" style="display:none">
<p>
    Drag and Drop the image below to your bookmark bar...
</p>
<a id="bookmark" title="Helix Preview" href="">
  <img title="Helix Preview" alt="Helix Preview" src="/helix_logo.png" style="height: 32px">
</a>
<p>
    ...or <button onclick="copy()">copy</button> the <b>Link Address</b> of the image and add the bookmark manually.
</p>

</div>

<script>
  function copy() {
    var text = document.getElementById('bookmark').href;
    navigator.clipboard.writeText(text)
  }

  function run() {
    var giturl = document.getElementById('giturl').value;
    var prefix = document.getElementById('prefix').value;
    var title = document.getElementById('title').value;
    if (!giturl) {
      alert('repository url is mandatory.');
      return;
    }
    giturl = new URL(giturl);
    var segs = giturl.pathname.substring(1).split('/');
    var owner = segs[0];
    var repo = segs[1];
    var ref = segs[3] || 'master';

    const url = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@v1');
    url.searchParams.append('owner', owner);
    url.searchParams.append('repo', repo);
    url.searchParams.append('ref', ref || 'master');
    url.searchParams.append('path', '/'); // dummy is needed by content proxy
    if (prefix) {
      url.searchParams.append('prefix', prefix);
    }
    const code = [
      'javascript:(function(){',
      `var u=new URL('${url.href}');`,
      `u.searchParams.append('lookup', window.location.href);`,
      `window.open(u)`,
      '})();',
    ].join('');
    var bm=document.getElementById('bookmark');
    bm.href = code;
    if (title) {
      bm.setAttribute('title', title);
      var img=bm.querySelector('img');
      img.setAttribute('title', title);
      img.setAttribute('alt', title);
    }
    document.getElementById('book').style.display = 'block';
  }

  function init() {
    var autorun=false;
    var params = new URLSearchParams(window.location.search);
    params.forEach((v,k) => {
      document.getElementById(k).value=v;
      autorun=true;
      if (k=='title') document.getElementById('form').style.display = 'none';
    })
    if (autorun) run();
  }

  init();
</script>

