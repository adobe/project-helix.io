<!--
/*
* Copyright 2018 Adobe. All rights reserved.
* This file is licensed to you under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License. You may obtain a copy
* of the License at http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software distributed under
* the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
* OF ANY KIND, either express or implied. See the License for the specific language
* governing permissions and limitations under the License.
*/
-->

# Start Developing Your First Helix Project in 60 Seconds

## Pre-Requisites

1. [Git](https://git-scm.com/) should be [installed](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup) on your machine.
2. For the sake of this mini tutorial we assume you are using [Visual Studio Code](https://code.visualstudio.com), our IDE of choice. However, any other JavaScript IDE would do as well.

## Let's Get Started

### 1. Download and Install `hlx`, the Helix Command Line Tool

```bash
# we'll provide a more concise download url soon...
curl -OL https://github.com/adobe/helix-cli/releases/download/v0.7.9/hlx_install.sh

chmod +x hlx_install.sh

./hlx_install.sh
```

### 2. Create Your First Helix Project

```bash
# our new project will be called 'hello_helix'
hlx demo hello_helix
```

### 3. Open the project in Visual Studio Code

```bash
cd hello_helix
code .
```

### 4. Launch the Local Helix Development Environment

```bash
hlx up
```

A browser window opens, rendering the projects generated homepage.

### 5. Set a Breakpoint and Start Debugging

In the IDE, navigate to `src/html.pre.js` in the left pane and double-click to open it. Set a breakpoint in the body of the `pre` function, switch to the Debug view and click on the green arrow in the toolbar.

### 6. Trigger the Breakpoint

Refresh the Browser, the Debugger will pause at the breakpoint. Take a look at the `payload` object in the Variables pane. Try changing the code, save the changes and see the results in the browser.
