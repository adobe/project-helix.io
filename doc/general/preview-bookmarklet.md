# Generate Preview Bookmarklet

<label for="giturl">Repository URL:</label><br>
<input id="giturl" placeholder="https://github.com/...." size="40"><br>
<br>
<label for="prefix">URL prefix (optional): </label><br>
<input id="prefix"><br>
<br>
<br>
<button onclick="run()">Generate Bookmarklet</button>
<br>
<br>

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
    var pfx = document.getElementById('prefix').value;
    if (!giturl) {
      alert('repository url is mandatory.');
      return;
    }
    giturl = new URL(giturl);
    var segs = giturl.pathname.substring(1).split('/');
    var owner = segs[0];
    var repo = segs[1];
    var ref = segs[3] || 'master';

    const url = new URL('https://adobeioruntime.net/api/v1/web/helix/helix-services/content-proxy@1.12.1-lookup-test-tripod');
    url.searchParams.append('owner', owner);
    url.searchParams.append('repo', repo);
    url.searchParams.append('ref', ref || 'master');
    url.searchParams.append('path', '/'); // dummy is needed by content proxy
    if (pfx) {
      url.searchParams.append('prefix', pfx);
    }
    const code = [
      'javascript:(function(){',
      `var u=new URL('${url.href}');`,
      `u.searchParams.append('lookup', window.location.href);`,
      `window.open(u)`,
      '})();',
    ].join('');
    document.getElementById('bookmark').href = code;
    document.getElementById('book').style.display = 'block';
  }
</script>

