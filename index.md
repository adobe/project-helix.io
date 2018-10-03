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

# Welcome to Project Helix

Helix is the new experience management service to create, manage, and deliver great digital experiences.

Better than a long story, just try it!

## Pre-Requisites

1. [Git](https://git-scm.com/) should be [installed](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup) on your machine.

## Run your first website in 60 Seconds

1. Download and install `hlx`, the [Helix command line tool](https://github.com/adobe/helix-cli).

```bash
# we'll provide a more concise download url soon...
curl -OL https://github.com/adobe/helix-cli/releases/download/v0.7.9/hlx_install.sh
chmod +x hlx_install.sh
./hlx_install.sh
```

2. Create your first Helix project.

```bash
# your new project will be called 'hello_helix'
hlx demo hello_helix
```

3. Launch the Helix local development environment

```bash
cd hello_helix
hlx up
```

A browser window opens, your first site is running!
