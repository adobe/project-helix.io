# Generate Preview Bookmarklet

<div id="form">
<label for="giturl">Repository URL:</label><br>
<input id="giturl" placeholder="https://github.com/...." size="40"><br>
<br>
<label for="outerhost">Production Hostname (optional): </label><br>
<input id="outerhost"><br>
<br>
<label for="project">Project Name (optional): </label><br>
<input id="project"><br>
<br>
<input type="hidden" id="title"><br>
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
    const text = document.getElementById('bookmark').href;
    navigator.clipboard.writeText(text)
  }

  function run() {
    let giturl = document.getElementById('giturl').value;
    const outerHost = document.getElementById('outerhost').value;
    const title = document.getElementById('title').value;
    const project = document.getElementById('project').value;
    if (!giturl) {
      alert('repository url is mandatory.');
      return;
    }
    giturl = new URL(giturl);
    const segs = giturl.pathname.substring(1).split('/');
    const owner = segs[0];
    const repo = segs[1];
    const ref = segs[3] || 'master';

    const innerHost = `${ref !== 'master' ? `${ref}--` : ''}${repo}--${owner}.hlx.page`;

    const code = [
      'javascript:(() => {',
      `window.hlxPreviewBookmarklet = {project:'${project}',innerHost:'${innerHost}',outerHost:'${outerHost}'}";`,
      'const script = document.createElement("script");',
      `script.src="//${window.location.host}/bookmarklets/preview.js";`,
      'document.body.appendChild(script);',
      '})();',
    ].join('');
    const bm=document.getElementById('bookmark');
    bm.href = code;
    if (title) {
      bm.setAttribute('title', title);
      const img=bm.querySelector('img');
      img.setAttribute('title', title);
      img.setAttribute('alt', title);
    }
    document.getElementById('book').style.display = 'block';
  }

  function init() {
    let autorun=false;
    const params = new URLSearchParams(window.location.search);
    params.forEach((v,k) => {
      const field = document.getElementById(k);
      if (!field) return;
      field.value = v;
      autorun = true;
      if (k === 'title') {
        document.getElementById('form').style.display = 'none';
      }
    })
    if (autorun) run();
  }

  init();
</script>
