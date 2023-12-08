import 'dart:developer';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../bloc/base_state.dart';
import '../model/k_node.dart';
import '../schema.dart';
import 'lowder.dart';
import 'bloc_handler.dart';

class LowderScreen extends StatefulWidget {
  final formKey = GlobalKey<FormState>();
  final WidgetNodeSpec spec;
  final Map state;

  LowderScreen(this.spec, this.state, {super.key});

  @override
  State<StatefulWidget> createState() => LowderScreenState();

  LocalBlocWidget getBlocWidget(String screenId, BlocBuilderFunction buildFunc, {BlocListenerFunction? listenFunc}) {
    return LocalBlocWidget(screenId, buildFunc, listener: listenFunc);
  }

  @protected
  Future<void> initState(BuildContext context) async {
    if (actions["onEnter"] != null) {
      var func = Lowder.actions.getFunction(context, actions["onEnter"], state, null);
      if (func != null) {
        func();
      }
    }
  }

  String get id => spec.id;
  String? get name => spec.name;
  Map get actions => spec.actions;
  Map get props => spec.props;
  Map get widgets => spec.widgets;
  Map get bodySpec => widgets["body"];

  static LowderScreen? of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<_KScreenScope>();
    return scope?.screen;
  }
}

class LowderScreenState extends State<LowderScreen> {
  String get id => widget.id;
  String? get name => widget.name;
  Map get state => widget.state;
  Map get bodySpec => widget.bodySpec;
  bool _initialized = false;

  EditorBlocConsumer getEditorHandler(String screenId, EditorBuildFunction buildFunc) =>
      EditorBlocConsumer(screenId, buildFunc);
  updateSpec() => widget.spec.widgets["body"] = Schema.getScreen(id)?.widgets["body"];

  void listener(BuildContext context, BaseState currentState) {}

  @override
  @nonVirtual
  Widget build(BuildContext context) {
    if (!Lowder.editorMode) {
      return internalBuild(context);
    }
    return getEditorHandler(widget.id, (context) {
      updateSpec();
      return internalBuild(context);
    });
  }

  @nonVirtual
  Widget internalBuild(BuildContext context) {
    return _KScreenScope(widget, child: widget.getBlocWidget(widget.id, builder, listenFunc: listener));
  }

  Widget builder(BuildContext context, BaseState currentState) {
    log("$name: Building Form from state ${currentState.runtimeType}.");

    if (currentState is ReloadState || currentState is ReloadAll) {
      _initialized = false;
    } else if (currentState is SetStateState) {
      state.addAll(currentState.state);
    }

    if (!_initialized) {
      _initialized = true;
      WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
        widget.initState(context);
      });
    }

    return Form(
      key: widget.formKey,
      autovalidateMode: AutovalidateMode.disabled,
      child: buildSpecBody(context, bodySpec),
    );
  }

  Widget buildSpecBody(BuildContext context, Map bodySpec) {
    try {
      final body = Lowder.widgets.buildWidget(context, bodySpec, state, null);
      return body;
    } catch (e, stack) {
      log("Error building '$name' body from spec.", error: e, stackTrace: stack);
      return Container();
    }
  }
}

class _KScreenScope extends InheritedWidget {
  final LowderScreen screen;
  const _KScreenScope(this.screen, {required super.child});

  @override
  bool updateShouldNotify(covariant InheritedWidget oldWidget) => false;
}