# How to develop with Helix

Once you went through the [basic steps](/index.html), you certainly wonder what can be done next.

Note: for the sake of this documentation page we assume you are using [Visual Studio Code](https://code.visualstudio.com), our IDE of choice. However, any other JavaScript IDE would do as well.

## Open the project in Visual Studio Code

```bash
cd hello_helix
code .
```

## Debugging

Set a break point in the IDE:

1. Navigate to `src/html.pre.js` in the left pane and double-click to open it
2. Set a breakpoint in the body of the `pre` function

Start the debugger:

1. Switch to the Debug view
2. Click on the green arrow in the toolbar

Trigger the Breakpoint

1. Refresh the browser, the Debugger will pause at the breakpoint
2. Take a look at the `payload` object in the Variables pane
3. Resume the debugger (play button)
