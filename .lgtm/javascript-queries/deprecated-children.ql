/**
 * @name Adobe Project Helix: Deprecated Children
 * @description the `context.children` property is deprecated and should not be used anymore
 * @kind problem
 * @problem.severity warning
 * @id js/helix/deprecated-children
 * @tags deprecation
 *       maintainability
 * @precision very-high
 */

import javascript

/** Gets the `context` parameter (that is, the first parameter) of a `pre` function. */
DataFlow::ParameterNode contextParameter() {
  exists (Module m, DataFlow::PropWrite export, DataFlow::FunctionNode pre |
    // `m` is defined in a file whose name ends in `.pre.js`
    m.getFile().getBaseName().matches("%.pre.js") and
    // it exports `pre` under the name `pre`
    m.exports("pre", export.getAstNode()) and
    pre.flowsTo(export.getRhs()) and
    // the `action` parameter is the second parameter of `pre`
    result = pre.getParameter(0)
  )
}

select contextParameter().getAPropertyRead("content").getAPropertyReference("children"),
       "Accessing deprecated property content.children."

