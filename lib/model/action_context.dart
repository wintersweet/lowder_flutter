import 'package:flutter/widgets.dart';

/// A structure containing contextual objects for an Action's execution.
class ActionContext {
  /// The existing state of the Screen from which the Action was triggered.
  final Map state;

  /// An optional Map containing contextual values. E.g. Lists will set "page" and "pageSize" attributes.
  final Map actionContext;

  /// The value triggering the Action. E.g. upon clicking on a row of a list,
  /// the "onSelect" action will transport the element of the array of data.
  final dynamic actionValue;

  /// The [BuildContext] from where the Action was triggered.
  final BuildContext buildContext;

  ActionContext(
      this.state, this.actionContext, this.actionValue, this.buildContext);
}

/// A class to return an Action's execution result.
/// [success] - a boolean indicating if an Action was successfully executed.
/// [returnData] - an optional data to be returned from the Action's execution.
/// [nextAction] - an optional Map with an Action specification (e.g.: an 'IfAction' evaluates a condition
/// and either the 'true' Action or the 'false' Action will be returned).
class ActionResult {
  final bool success;
  final dynamic returnData;
  final Map? nextAction;
  final String? failureMessage;

  ActionResult(this.success,
      {this.returnData, this.nextAction, this.failureMessage});
}

/// An [ActionResult] variation, indicating ActionFactory that an 'action indicator' should not be displayed.
class SilentActionResult extends ActionResult {
  SilentActionResult(super.success, {super.returnData, super.nextAction});
}

/// An [ActionResult] variation, indicating ActionFactory that in case of error, a Http error handling should be called.
/// E.g.: give oportunity to renew an expired access token.
class HttpActionResult extends ActionResult {
  HttpActionResult(super.success, {super.returnData, super.nextAction});
}

/// A class used by ActionFactory to determine if a failed Action should by retried.
class RetryAction {
  final bool retry;
  RetryAction(this.retry);
}
