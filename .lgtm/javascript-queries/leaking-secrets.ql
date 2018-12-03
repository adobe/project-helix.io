/**
 * @name Adobe Project Helix: Leaking Secrets
 * @description the `action.secrets` property secret and should not be logged or recorded
 * @kind problem
 * @problem.severity warning
 * @id js/helix/leaking-secrets
 * @tags security
 * @precision very-high
 */
import javascript

/** Gets an `action` parameter (that is, the second parameter) of a `pre` function. */
DataFlow::ParameterNode actionParameter() {
  exists (Module m, DataFlow::PropWrite export, DataFlow::FunctionNode pre |
    // `m` is defined in a file whose name ends in `.pre.js`
    m.getFile().getBaseName().matches("%.pre.js") and
    // it exports `pre` under the name `pre`
    m.exports("pre", export.getAstNode()) and
    pre.flowsTo(export.getRhs()) and
    // the `action` parameter is the second parameter of `pre`
    result = pre.getParameter(1)
  )
}

/**
 * A taint-tracking configuration for tracking uses of the `secrets` properties of `action` parameters
 * into logger calls.
 */
class ActionSecretTracking extends TaintTracking::Configuration {
  ActionSecretTracking() { this = "ActionSecretTracking" }

  override predicate isSource(DataFlow::Node nd) {
    // the `secrets` properties of `action` parameters are our sources
    // (taint propagates through property reads, so all properties of a
    // taint source are also considered tainted) 
    nd = actionParameter().getAPropertyRead("secrets")
  }

  override predicate isSink(DataFlow::Node nd) {
    // an argument to a call `console.m(...)` for any `m`
    nd = DataFlow::globalVarRef("console").getAMethodCall().getAnArgument()
    or
    // an argument to a call `action.logger.m(...)` for any `m`
    nd = actionParameter().getAPropertyRead("logger").getAMethodCall().getAnArgument()
  }
}

from ActionSecretTracking cfg, DataFlow::Node source, DataFlow::Node sink
where cfg.hasFlow(source, sink)
select sink, "Logging secret information from $@.", source, "here"

