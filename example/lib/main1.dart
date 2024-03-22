import 'package:flutter/material.dart';
import 'package:lowder/factory/action_factory.dart';
import 'package:lowder/factory/property_factory.dart';
import 'package:lowder/factory/widget_factory.dart';
import 'package:lowder/widget/lowder.dart';
import 'factory/actions.dart';
import 'factory/properties.dart';
import 'factory/widgets.dart';
import 'dart:io';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final file = File('assets/editor.html'); // 替换成你的文件路径
  file.readAsLines().then((lines) {
    print(lines); // 输出文件内容每一行的内容
  });

  runApp(DemoApp());
}

class DemoApp extends Lowder {
  DemoApp({super.environment, super.editorMode, super.editorServer, super.key})
      : super("Demo Solution");

  @override
  AppState createState() => _DemoAppState();
  @override
  WidgetFactory createWidgetFactory() => SolutionWidgets();
  @override
  ActionFactory createActionFactory() => SolutionActions();
  @override
  PropertyFactory createPropertyFactory() => SolutionProperties();

  @override
  List<SolutionSpec> get solutions => [
        SolutionSpec(
          "My Demo Solution",
          filePath: "assets/solution.low",
          widgets: SolutionWidgets(),
          actions: SolutionActions(),
          properties: SolutionProperties(),
        ),
      ];

  @override
  getTheme() => ThemeData.dark(useMaterial3: true);
}

class _DemoAppState extends AppState with WidgetsBindingObserver {
  @override
  void initState() {
    WidgetsBinding.instance.addObserver(this);

    super.initState();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
