# Generate Preview Bookmarklet

<div>
  <p>Generic Preview Bookmarklet is deprecated. You will be redirected to Helix Sidekick now ...</p>
</div>

<div id="form" style="display:none">
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
<br>
<br>
</div>

<script>

  function run() {
    let giturl = document.getElementById('giturl').value;
    const outerHost = document.getElementById('outerhost').value;
    const title = document.getElementById('title').value;
    const project = document.getElementById('project').value;

    const skUrl = new URL('https://www.hlx.page/tools/sidekick/');
    if (giturl) {
      skUrl.search = new URLSearchParams([
        ['giturl', giturl],
        ['host', outerHost],
        ['project', project],
      ]).toString();
    }
    window.location.href = skUrl.toString();
  }

  function init() {
    let autorun=false;
    const params = new URLSearchParams(window.location.search);
    params.forEach((v,k) => {
      const field = document.getElementById(k);
      if (!field) return;
      field.value = v;
    });
    run();
  }

  init();
</script>
