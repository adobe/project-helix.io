# How does Helix work?

This page takes a behind-the-scenes look at the overall Helix architecture and describes its main components.

<img src="/assets/helix-overview.png" alt="Helix Architecture Overview" width="100%"/>

Helix uses the **Fastly CDN** to deliver content, using **VCL edge code** to route and process client requests.

That VCL Edge Code is generated by the **[hlx publish](https://github.com/adobe/helix-cli)** command along with the **Helix Publish Service** deployed in **Adobe I/O Runtime**.

Together, they generate and setup the appropriate Fastly VCL code and configurations based on the contents
of the **source GitHub repository** which provides the content, rendering templates and code along with 
the (optional) Helix configuration file.

The **hlx deploy** command is used to deploy the rendering code to **Adobe I/O Runtime**, based on the rendering templates and code
supplied in the **GitHub source repository**.

The content, code and static files can come from one or several GitHub repositories. People usually start with a single repository for simple examples, but splitting it is often useful later for clarity and separation of concerns.

Updates to the Helix configurations and rendering code are deployed atomically by the Helix tools.

Helix Strains, defined in the Helix Configuration file, let users define staged or development variants of their content, as well as proxying parts of their content tree to other services. The publishing process converts these definitions to VCL edge processing code that executes the corresponding request routing logic at the edge.

_TODO: link to the relevant parts of the documentation once we have them._