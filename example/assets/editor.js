var pointerX = 0;
var pointerY = 0;
document.onmousemove = function(event) {
  pointerX = event.pageX;
  pointerY = event.pageY;
}

function showModalError(title, message) {
  const messageElement = document.createElement("span");
  messageElement.className = "modal-row-label";
  messageElement.innerHTML = message;
  showModalForm(title, messageElement);
}

function showModalForm(title, form, onOk, canClose = true) {
  const closeFunction = () => document.body.removeChild(fullScreen);

  const modal = document.createElement("column");
  modal.className = "modal-form";

  const titleHolder = document.createElement("row");
  titleHolder.className = "modal-form-title";
  modal.appendChild(titleHolder);

  const titleElement = document.createElement("span");
  titleElement.innerHTML = title;
  titleHolder.appendChild(titleElement);

  const formHolder = document.createElement("div");
  formHolder.className = "modal-form-content";
  formHolder.appendChild(form);
  modal.appendChild(formHolder);

  if (onOk) {
    const buttons = document.createElement("span");
    buttons.className = "modal-form-buttons";
    modal.appendChild(buttons);

    if (canClose) {
      const cancelButton = document.createElement("span");
      cancelButton.innerHTML = "Cancel";
      cancelButton.onclick = () => document.body.removeChild(fullScreen);
      buttons.appendChild(cancelButton);
    }
    const okButton = document.createElement("span");
    okButton.innerHTML = "Ok";
    okButton.onclick = async () => {
      if (await onOk() !== false) {
        closeFunction();
      }
    };
    buttons.appendChild(okButton);
  } else if (canClose) {
    const closeButton = document.createElement("icon");
    closeButton.className = "material-symbols-outlined modal-form-close-button";
    closeButton.innerHTML = "cancel";
    closeButton.onclick = () => closeFunction();
    titleHolder.appendChild(closeButton);
  }

  if (!title && titleHolder.children.length === 1) {
    titleHolder.remove();
  }

  const fullScreen = document.createElement("div");
  fullScreen.className = "modal-background";
  fullScreen.appendChild(modal);
  document.body.appendChild(fullScreen);

  return closeFunction;
}

function showModalList(referenceElement, options, onSelect, title = null) {
  if (options.length === 1) {
    onSelect(options[0]);
    return;
  }

  const modal = document.createElement("column");
  modal.className = "modal-select";

  if (title) {
    const titleHolder = document.createElement("span");
    titleHolder.innerText = title;
    titleHolder.className = "modal-select-title";
    modal.appendChild(titleHolder);
  }

  if (options.length > 10) {
    const searchInput = document.createElement("input");
    searchInput.setAttribute("placeholder", "search");
    searchInput.onkeyup = () => searchFunc(searchInput.value);
    modal.appendChild(searchInput);
    window.setTimeout(() => searchInput.focus());
  }

  const optionsHolder = document.createElement("column");
  optionsHolder.className = "modal-select-options";
  modal.appendChild(optionsHolder);

  const searchFunc = (text) => {
    text = text.toLowerCase();
    optionsHolder.innerHTML = "";
    for (const value of options) {
      const name = typeof value === 'object' ? value.name : value;
      if (text && name.toLowerCase().indexOf(text) < 0) {
        continue;
      }

      const option = document.createElement("span");
      option.className = "modal-option";
      option.innerHTML = name;
      option.onclick = () => {
        onSelect(value);
      }
      if (value.title) {
        option.title = value.title;
      }
      optionsHolder.appendChild(option);
    }
  };
  searchFunc("");

  const fullScreen = document.createElement("div");
  fullScreen.className = "modal-background";
  fullScreen.appendChild(modal);
  fullScreen.onclick = () => document.body.removeChild(fullScreen);
  document.body.appendChild(fullScreen);

  if (!referenceElement) {
    modal.style.left = Math.min(pointerX, document.body.clientWidth - modal.clientWidth) + "px";
    modal.style.top = Math.min(pointerY, document.body.clientHeight - modal.clientHeight) + "px";
  }
}

function buildTable(columns, rows, values) {
  const table = document.createElement("table");
  table.className = "table-container";
  _buildTable(table, columns, rows, values);
  return table;
}
function _buildTable(table, columns, rows, values) {
  table.innerHTML = "";

  const buildColumn = (name) => {
    const nameElement = document.createElement("span");
    nameElement.innerHTML = name;
    const deleteButton = document.createElement("icon");
    deleteButton.className = "material-symbols-outlined";
    deleteButton.innerHTML = "delete";
    deleteButton.onclick = () => {
      const idx = columns.indexOf(name);
      columns.splice(idx, 1);
      for (let entry of values) {
        entry.splice(idx, 1);
      }
      _buildTable(table, columns, rows, values);
    };

    const column = document.createElement("th");
    column.className = "table-column-title";
    column.appendChild(nameElement);
    column.appendChild(deleteButton);
    row.appendChild(column);
  }

  let row = document.createElement("tr");
  row.appendChild(document.createElement("th"));
  for (let name of columns) {
    buildColumn(name);
  }
  
  const addButton = document.createElement("icon");
  addButton.className = "material-symbols-outlined";
  addButton.innerHTML = "add";
  addButton.onclick = () => {
    const input = document.createElement("input");
    input.setAttribute("placeholder", "Name the new column");
    showModalForm("New Column", input, () => {
      if (input.value) {
        columns.push(input.value);
        for (let entry of values) {
          entry.push("");
        }
        _buildTable(table, columns, rows, values);
      }
    });
    input.focus();
  };
  const addColumn = document.createElement("th");
  addColumn.appendChild(addButton);

  row.appendChild(addColumn);
  table.appendChild(row);

  for (let i = 0; i < rows.length; i++) {
    row = _buildTableValueRow(i, rows, values);
    table.appendChild(row);
  }

  const onNewRow = () => {
    table.removeChild(addRow);
    row = _buildTableValueRow(rows.length - 1, rows, values);
    table.appendChild(row);
    table.appendChild(addRow);
  };
  const addRow = _buildTableAddRow(rows, values, columns.length, onNewRow);
  table.appendChild(addRow);
}
function _buildTableValueRow(idx, keysArray, valuesArray) {
  const rowValue = keysArray[idx];
  const valueList = valuesArray[idx];
  const dataRow = document.createElement("tr");

  const rowTitle = document.createElement("td");
  rowTitle.className = "table-row-title";
  rowTitle.innerHTML = rowValue;
  dataRow.appendChild(rowTitle);

  for (let j = 0; j < valueList.length; j++) {
    let holder = document.createElement("td");
    holder.className = "table-value";
    dataRow.appendChild(holder);

    let item = document.createElement("input");
    item.value = valueList[j];
    item.onchange = () => valueList[j] = item.value;
    holder.appendChild(item);
  }

  const deleteButton = document.createElement("icon");
  deleteButton.className = "material-symbols-outlined";
  deleteButton.innerHTML = "delete";
  deleteButton.onclick = () => {
    keysArray.splice(keysArray.indexOf(rowValue), 1);
    valuesArray.splice(valuesArray.indexOf(valueList), 1);
    dataRow.parentElement.removeChild(dataRow);
  };
  const deleteRow = document.createElement("td");
  deleteRow.className = "table-row-delete";
  deleteRow.appendChild(deleteButton);
  dataRow.appendChild(deleteRow);

  return dataRow;
}
function _buildTableAddRow(keysArray, valuesArray, numCols, onAdded) {
  const addNew = document.createElement("input");
  addNew.setAttribute("placeholder", "Add new");
  addNew.onchange = () => {
    if (addNew.value) {
      keysArray.push(addNew.value);
      var newValues = [];
      for (let i = 0; i < numCols; i++) newValues.push("");
      valuesArray.push(newValues);
      onAdded();
      addNew.value = "";
    }
  };
  window.setTimeout(() => addNew.focus());

  const addNewHolder = document.createElement("td");
  addNewHolder.className = "table-value";
  addNewHolder.appendChild(addNew);

  const row = document.createElement("tr");
  row.appendChild(addNewHolder);
  return row;
}

function show(elementId) {
  const element = document.getElementById(elementId);
  if (!element.classList.contains("show")) {
    element.classList.remove("hide");
    element.classList.add("show");
  }
}

function selectCollapsibleTab(evt, idx, expand) {
  let target = evt.target;
  while (target && !target.classList.contains("collapsible-tabs")) {
    target = target.parentElement;
  }
  if (!target) {
    return;
  }

  const panels = target.getElementsByClassName("collapsible-tabs-panels")[0];
  for (let panel of panels.children) {
    panel.classList.add("hidden");
  }
  panels.children[idx].classList.remove("hidden");

  const buttons = target.getElementsByClassName("collapsible-tabs-buttons")[0];
  for (let button of buttons.children) {
    button.classList.remove("collapsible-tabs-button-selected");
  }
  buttons.children[idx].classList.add("collapsible-tabs-button-selected");

  if (expand) {
    toggleCollapsibleTabs(evt, expand);
  }
}
function toggleCollapsibleTabs(evt, expand) {
  let target = evt.target;
  while (target && !target.classList.contains("collapsible-tabs")) {
    target = target.parentElement;
  }

  if (target) {
    if (expand || target.classList.contains("collapsible-tabs-collapsed")) {
      target.classList.remove("collapsible-tabs-collapsed");
    } else {
      target.classList.add("collapsible-tabs-collapsed");
    }
  }
}

function tabClick(tabHolderId, panelHolderId, idx) {
  const tabHolder = document.getElementById(tabHolderId);
  for (let child of tabHolder.children)
    child.classList.remove("tab-item-selected");
  tabHolder.children[idx].classList.add("tab-item-selected");

  const panelHolder = document.getElementById(panelHolderId);
  for (let i = 0; i < panelHolder.children.length; i++) {
    let child = element = panelHolder.children[i];
    if (i === idx) {
      child.classList.remove("tab-panel-invisible");
      if (child.onVisible) {
        child.onVisible();
      }
    } else {
      child.classList.add("tab-panel-invisible");
      if (child.onInvisible) {
        child.onInvisible();
      }
    }
  }
}

function showToast(message) {
  if (window.snackbarTimeout) {
    window.clearTimeout(window.snackbarTimeout);
  }

  const span = document.createElement("span");
  span.innerText = message;

  const snackbar = document.getElementById("snackbar");
  while (snackbar.children.length > 5) {
    snackbar.children[0].remove();
  }
  snackbar.appendChild(span);
  snackbar.classList.remove("snackbar-hide");
  snackbar.classList.add("snackbar-show");

  window.snackbarTimeout = setTimeout(() => {
    snackbar.classList.add("snackbar-hide");
    snackbar.classList.remove("snackbar-show");
    window.snackbarTimeout = window.setTimeout(() => {
      snackbar.innerHTML = "";
      snackbar.classList.remove("snackbar-hide");
    }, 500);
  }, 2000);
}

function childOf(/*child node*/c, /*parent node*/p) {
  if (!c || !p) return false;
  if (c === p) return true;
  while((c=c.parentNode)&&c!==p);
  return !!c;
}

function stringify(obj) {
  const replacer = (k, v) => {
    if (v === null || v === undefined || v === "null" || v === "undefined" || k === "_children" || k === "_solution") {
      return undefined;
    }
    if (typeof v === "string") {
      if (v.length == 0) {
        return undefined;
      }
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        return undefined;
      }
    } else if (v.constructor === Object) {
      if (Object.keys(v).length === 0) {
        return undefined;
      }
    }
    return v;
  };

  let jsonString = JSON.stringify(obj, replacer, "  ");
  while (jsonString !== undefined && jsonString.includes("{}")) {
    jsonString = JSON.stringify(JSON.parse(jsonString), replacer, "  ");
  }
  return jsonString;
}

function getIconForWidget(type) {
  switch (type?.toLowerCase()) {
    case "screen":
      return "phone_iphone";
    case "text":
    case "textfield":
    case "textformfield":
    case "richtext":
    case "textspan":
      return "text_fields";
    case "listtile":
      return "short_text";
    case "switch":
      return "toggle_on";
    case "checkbox":
      return "check_box";
    case "scaffold":
      return "view_quilt";
    case "container":
      return "pageless";
    case "card":
      return "team_dashboard";
    case "row":
      return "view_agenda";
    case "column":
      return "view_column_2";
    case "wrap":
      return "flex_wrap";
    case "list":
    case "listview":
    case "staticlistview":
    case "tableview":
    case "datatableview":
      return "view_list";
    case "gridview":
    case "staticgridview":
      return "grid_view";
    case "pageview":
    case "staticpageview":
      return "dual_screen";
    case "appbar":
      return "toolbar";
    case "sizedbox":
      return "select";
    case "textbutton":
    case "elevatedbutton":
    case "outlinedbutton":
    case "floatingactionbutton":
    case "iconbutton":
      return "smart_button";
    case "inkwell":
      return "touch_app";
    case "icon":
      return "account_box";
    case "image":
    case "imageurl":
    case "imageasset":
      return "image";
    case "datepicker":
      return "calendar_month";
    case "avatar":
    case "circleavatar":
      return "account_circle";
    case "tabbar":
    case "tabview":
    case "tabbarview":
      return "tabs";
    case "drawer":
      return "menu";
    case "drawerheader":
      return "subheader";
    case "userdrawerheader":
      return "insert_emoticon";
    case "circularprogressindicator":
      return "progress_activity";
    case "blocbuilder":
    case "blocconsumer":
      return "construction";
    case "navigationrail":
      return "side_navigation";
    case "bottomappbar":
    case "bottomnavigationbar":
      return "bottom_navigation";
    case "popupmenu":
    case "popupmenubutton":
      return "more_vert";
    case "select":
    case "dropdown":
    case "dropdownbutton":
      return "list";
    case "slider":
      return "tune";
    case "hero":
      return "domino_mask";
    case "animatedcontainer":
    case "animatedpositioned":
      return "transition_chop";
    case "center":
      return "center_focus_weak";
    case "stack":
      return "stacks";
    case "positioned":
      return "target";
    case "expanded":
      return "pan_zoom";
    case "component":
    case "widgetcomponent":
    case "preferredsizecomponent":
      return "link";
    case "scrollview":
    case "singlechildscrollview":
      return "swipe_vertical";
    default:
      return "view_compact";
      return "fullscreen";
  }
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
  if (hex.length === 8) {
        hex = hex.slice(2);
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padLeft(r, '0', 2) + padLeft(g, '0', 2) + padLeft(b, '0', 2);
}

function padLeft(str, char, len) {
    len = len || 2;
    var zeros = new Array(len).join(char);
    return (zeros + str).slice(-len);
}

function mergeMaps(map1, map2, replace = false) {
  for (let key in map2) {
    if (replace || !map1.hasOwnProperty(key)) {
      map1[key] = map2[key];
    }
  }
}

function getUUID() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++)
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class EditorPanel {
  constructor() { }
  populate() { }
  selectNode(node) { }
  onNodeCreated(origin, node, screen) { }
  onNodeUpdated(origin, node, screen) { }
  onNodeDeleted(origin, node, screen) { }
}


class Routing {
    constructor() {
        this.hOffset = 20;
        this.vOffset = 20;
        this.hEdgeOffset = 0;
        this.vEdgeOffset = 0;
        this.laneWidth = 4;
        this.hAlign = "center";
        this.vAlign = "center";
        this.termination = "arrow";
        this.gridLanes = {};
        this.inPositions = ["top", "left"];
        this.outPositions = ["right", /*"bottom"*/];
    }

    getRoute(start, finish) {
        const positions = this.getPositions(start, finish);
        const points = [];
        this.addEdgePoint(start, positions.outPos, points);
        const outAxis = positions.outPos === "right" || positions.outPos === "left";
        const inAxis = positions.inPos === "right" || positions.inPos === "left";

        // Neighbours X
        if ((finish.xIndex - start.xIndex === 1 && positions.outPos === "right" && positions.inPos === "left") ||
            (finish.xIndex - start.xIndex === -1 && positions.outPos === "left" && positions.inPos === "right")) {
            if (finish.yIndex !== start.yIndex || Math.abs(start.top - finish.top) > 20) {
                this.addOutInflectionPoint(start, finish, positions, points);
                this.addLastInflectionPoint(finish, positions, points);
            }
        }

        // Neighbours Y
        else if ((finish.yIndex - start.yIndex === 1 && positions.outPos === "bottom" && positions.inPos === "top") ||
            (finish.yIndex - start.yIndex === -1 && positions.outPos === "top" && positions.inPos === "bottom")) {
            if (finish.xIndex !== start.xIndex || Math.abs(start.left - finish.left) > 20) {
                this.addOutInflectionPoint(start, finish, positions, points);
                this.addLastInflectionPoint(finish, positions, points);
            }
        }

        else {
            this.addOutInflectionPoint(start, finish, positions, points);
            this.addSecondInflectionPoint(start, finish, positions, points);
            if (outAxis === inAxis)
                this.addThirdInflectionPoint(start, finish, positions, points);
            this.addLastInflectionPoint(finish, positions, points);
        }
        this.addEdgePoint(finish, positions.inPos, points);

        if (this.termination === "arrow")
            this.addTerminationArrow(points);

        const radius = 6;
        let prevX, x, prevY, y;
        let pathString = "";
        let previousPoint = null;
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            x = p.x;
            y = p.y;

            if (i > 0) {
                let r = radius;
                // if (p.x != previousPoint.x)
                //     r = Math.min(r, Math.abs(p.x - previousPoint.x)/2);
                // if (p.y != previousPoint.y)
                //     r = Math.min(r, Math.abs(p.y - previousPoint.y)/2);
                if (i > 1 && i < points.length - 4) {
                    // Create a rounded corner
                    let flag = "0,0";
                    if (previousPoint.x === p.x) {
                        y = previousPoint.y > p.y ? y = previousPoint.y - r : previousPoint.y + r;
                        if (x > prevX && y > prevY || x < prevX && y < prevY)
                            flag = "0,1";
                    }

                    else {
                        x = previousPoint.x > p.x ? x = previousPoint.x - r : previousPoint.x + r;
                        if (x > prevX && y < prevY || x < prevX && y > prevY)
                            flag = "0,1";
                    }
                    pathString += " A" + r + "," + r + " 0 " + flag + " " + x + "," + y;
                }

                x = p.x;
                y = p.y;
                if (i < points.length - 5) {
                    if (previousPoint.x === p.x)
                        y = previousPoint.y > p.y ? p.y + r : p.y - r;

                    else
                        x = previousPoint.x < p.x ? p.x - r : p.x + r;
                }
                pathString += " L" + x + "," + y;
            }

            else
                pathString += "M" + x + "," + y;
            prevX = x;
            prevY = y;
            previousPoint = p;
        }

        return pathString;
    }

    addOutInflectionPoint(start, finish, positions, points) {
        var lane;
        switch (positions.outPos) {
            case "right":
                lane = this.getEmptyXLane(start.xIndex, start.code, "outLane");
                points.push({ x: points[0].x + this.hOffset + (this.laneWidth * (lane + 1)), y: points[0].y });
                break;
            case "left":
                lane = this.getEmptyXLane(start.xIndex - 1, start.code, "outLane");
                points.push({ x: points[0].x - this.hOffset - (this.laneWidth * (lane + 1)), y: points[0].y });
                break;
            case "bottom":
                lane = this.getEmptyYLane(start.yIndex, start.code, "outLane");
                points.push({ x: points[0].x, y: points[0].y + this.vOffset + (this.laneWidth * (lane + 1)) });
                break;
            case "top":
                lane = this.getEmptyYLane(start.yIndex - 1, start.code, "outLane");
                points.push({ x: points[0].x, y: points[0].y - this.vOffset - (this.laneWidth * (lane + 1)) });
                break;
            default: break;
        }
    }

    addSecondInflectionPoint(start, finish, positions, points) {
        var lane;
        var inPos = positions.inPos;

        if ((positions.outPos === "right" || positions.outPos === "left") && (inPos === "right" || inPos === "left")) {
            if (start.yIndex > finish.yIndex)
                inPos = "bottom";

            else
                inPos = "top";
        }
        else if ((positions.outPos === "top" || positions.outPos === "bottom") && (inPos === "top" || inPos === "bottom")) {
            if (start.xIndex > finish.xIndex)
                inPos = "right";

            else
                inPos = "left";
        }

        switch (inPos) {
            case "right":
                lane = this.getEmptyYLane(finish.yIndex, start.code, finish.code);
                points.push({ x: finish.right + this.hOffset + (this.laneWidth * (lane + 1)), y: points[points.length - 1].y });
                break;
            case "left":
                lane = this.getEmptyYLane(finish.yIndex - 1, start.code, finish.code);
                points.push({ x: finish.left - this.hOffset - (this.laneWidth * (lane + 1)), y: points[points.length - 1].y });
                break;
            case "bottom":
                lane = this.getEmptyXLane(finish.xIndex, start.code, finish.code);
                points.push({ x: points[points.length - 1].x, y: finish.bottom + this.vOffset + (this.laneWidth * (lane + 1)) });
                break;
            case "top":
                lane = this.getEmptyXLane(finish.xIndex - 1, start.code, finish.code);
                points.push({ x: points[points.length - 1].x, y: finish.top - this.vOffset - (this.laneWidth * (lane + 1)) });
                break;
            default: break;
        }
    }

    addThirdInflectionPoint(start, finish, positions, points) {
        var lane;
        switch (positions.inPos) {
            case "right":
                lane = this.getEmptyXLane(finish.xIndex, "inLane", finish.code);
                points.push({ x: finish.right + this.hOffset + (this.laneWidth * (lane + 1)), y: points[points.length - 1].y });
                break;
            case "left":
                lane = this.getEmptyXLane(finish.xIndex - 1, "inLane", finish.code);
                points.push({ x: finish.left - this.hOffset - (this.laneWidth * (lane + 1)), y: points[points.length - 1].y });
                break;
            case "bottom":
                lane = this.getEmptyYLane(finish.yIndex, "inLane", finish.code);
                points.push({ x: points[points.length - 1].x, y: finish.bottom + this.vOffset + (this.laneWidth * (lane + 1)) });
                break;
            case "top":
                lane = this.getEmptyYLane(finish.yIndex - 1, "inLane", finish.code);
                points.push({ x: points[points.length - 1].x, y: finish.top - this.vOffset - (this.laneWidth * (lane + 1)) });
                break;
            default: break;
        }
    }

    addLastInflectionPoint(finish, positions, points) {
        switch (positions.inPos) {
            case "left":
            case "right":
                points.push({ x: points[points.length - 1].x, y: this.getObjEdgePoint(finish, false) + this.vEdgeOffset });
                break;
            case "top":
            case "bottom":
                points.push({ x: this.getObjEdgePoint(finish, true) + this.hEdgeOffset, y: points[points.length - 1].y });
                break;
            default: break;
        }
    }

    addEdgePoint(obj, position, points) {
        switch (position) {
            case "left":
                points.push({ x: obj.left, y: this.getObjEdgePoint(obj, false) + this.vEdgeOffset });
                break;
            case "top":
                points.push({ x: this.getObjEdgePoint(obj, true) + this.hEdgeOffset, y: obj.top });
                break;
            case "right":
                points.push({ x: obj.right, y: this.getObjEdgePoint(obj, false) + this.vEdgeOffset });
                break;
            case "bottom":
                points.push({ x: this.getObjEdgePoint(obj, true) + this.hEdgeOffset, y: obj.bottom });
                break;
            default:
                break;
        }
    }

    getObjEdgePoint(obj, horizontal) {
        if (horizontal) {
            switch (this.hAlign) {
                case "center":
                    return (obj.right - obj.left) / 2 + obj.left;
                case "right":
                    return obj.right;
                default:
                    return obj.left;
            }
        }

        else {
            switch (this.vAlign) {
                case "center":
                    return (obj.bottom - obj.top) / 2 + obj.top;
                case "bottom":
                    return obj.bottom;
                default:
                    return obj.top;
            }
        }
    }

    addTerminationArrow(points) {
        var arrowHeight = 10;
        var fromX = points[points.length - 2].x;
        var fromY = points[points.length - 2].y;
        var toX = points[points.length - 1].x;
        var toY = points[points.length - 1].y;
        var angle = Math.atan2(toY - fromY, toX - fromX);
        points.push({ x: toX - arrowHeight * Math.cos(angle - Math.PI / 6), y: toY - arrowHeight * Math.sin(angle - Math.PI / 6) });
        points.push({ x: toX, y: toY });
        points.push({ x: toX - arrowHeight * Math.cos(angle + Math.PI / 6), y: toY - arrowHeight * Math.sin(angle + Math.PI / 6) });
        points.push({ x: toX, y: toY });
    }

    getPositions(start, finish) {
        var i, j;
        var minCost = null;
        var inPosition = null;
        var outPosition = null;

        for (i = 0; i < this.outPositions.length; i++) {
            var cost = 4;
            var outP = this.outPositions[i];
            for (j = 0; j < this.inPositions.length; j++) {
                var inP = this.inPositions[j];
                var outAxis = outP === "right" || outP === "left";
                var inAxis = inP === "right" || inP === "left";

                // Neighbours X
                if ((finish.xIndex - start.xIndex === 1 && outP === "right" && inP === "left") ||
                    (finish.xIndex - start.xIndex === -1 && outP === "left" && inP === "right")) {
                    cost = 0;
                    if (finish.yIndex !== start.yIndex)
                        cost = 2;
                }

                // Neighbours Y
                else if ((finish.yIndex - start.yIndex === 1 && outP === "bottom" && inP === "top") ||
                    (finish.yIndex - start.yIndex === -1 && outP === "top" && inP === "bottom")) {
                    cost = 0;
                    if (finish.xIndex !== start.xIndex)
                        cost = 2;
                }
                else if (outAxis !== inAxis)
                    cost = 3;

                if (minCost === null || minCost > cost) {
                    minCost = cost;
                    inPosition = inP;
                    outPosition = outP;
                }
            }
        }
        return { inPos: inPosition, outPos: outPosition };
    }

    getEmptyXLane(xIndex, start, finish) {
        var i = 0;
        delete this.gridLanes[this.gridLanes["x_" + start + "_" + finish]];
        while (this.gridLanes["x_" + xIndex + "_" + i])
            i++;
        this.gridLanes["x_" + start + "_" + finish] = "x_" + xIndex + "_" + i;
        this.gridLanes["x_" + xIndex + "_" + i] = start + "_" + finish;
        return i;
    }
    
    getEmptyYLane(yIndex, start, finish) {
        var i = 0;
        delete this.gridLanes[this.gridLanes["y_" + start + "_" + finish]];
        while (this.gridLanes["y_" + yIndex + "_" + i])
            i++;
        this.gridLanes["y_" + start + "_" + finish] = "y_" + yIndex + "_" + i;
        this.gridLanes["y_" + yIndex + "_" + i] = start + "_" + finish;
        return i;
    }
}

class Grid {
    constructor(gridHolder) {
        this.holder = gridHolder;
        this.nodeToPosition = {};
        this.positionToNode = {};
    }

    getNodePosition(node) {
        return this.nodeToPosition[node.getId()];
    }
    
    getNextPosition(node, parentNode) {
        let x = 0;
        let y = 0;
        if (parentNode) {
            const pos = this.nodeToPosition[parentNode.getId()];
            x = pos.x + 1;
            y = pos.y;
        }
        while (this.positionToNode[x + "-" + y]) {
            y++;
        }

        const pos = { x, y };
        this.positionToNode[x + "-" + y] = node;
        this.nodeToPosition[node.getId()] = pos;
        return pos;
    }
}

class PropertyPanel extends EditorPanel {
  constructor() {
    super();
    this.id = "property-panel";
    this.modelNode;
  }

  populate() {
    const rootPanel = document.getElementById(this.id);
    rootPanel.innerHTML = "";
    this.modelNode = null;
    this.solutionId = null;
    this.solutionSchema = null;
  }

  selectNode(node) {
    this.modelNode = node;
    this.solutionId = node.getSolutionId();
    this.solutionSchema = Editor.project.getSchema(this.solutionId);

    const schemaProperties = node.getPropertySchema() ?? {};
    const nodeProperties = node.getProperties();
    const template = (node.getTemplate ? node.getTemplate()?.getProperties() : {}) ?? {};

    const rootPanel = document.getElementById(this.id);
    rootPanel.innerHTML = "";
    this.buildHeader(rootPanel, node);

    if (node instanceof TypeNode && node["extends"] === "KModel") {
      this.buildTypePropertyEditor(rootPanel, node);
    } else {
      for (let key in schemaProperties) {
        if (this.solutionSchema.isWidget(schemaProperties[key]) || this.solutionSchema.isAction(schemaProperties[key])) {
          continue;
        }
        this.createPropertyElement(rootPanel, key, schemaProperties[key], nodeProperties, template);
      }

      if (node instanceof Component) {
        // Allow user to expose properties from Component's widgets
        this.buildComponentPropertyEditor(rootPanel, node);
      }
    }
  }

  buildHeader(rootElement, node) {
    const holder = document.createElement("div");
    holder.className = this.id + "-item-header";
    rootElement.appendChild(holder);

    const nameElement = document.createElement("input");
    nameElement.className = this.id + "-item-header-name";
    nameElement.value = node.getName() ?? "";
    nameElement.onchange = () => {
      this.logInfo(`name updated to ${nameElement.value}.`);
      node.setName(nameElement.value);
      Editor.onNodeUpdated(this.id, node);
    };
    holder.appendChild(nameElement);

    const typeElement = document.createElement("span");
    typeElement.className = this.id + "-item-header-type";
    if (!(node instanceof TypeNode)) {
      typeElement.innerHTML = node.getType();
    }
    holder.appendChild(typeElement);
    
    if (node.isRootNode) {
      const folderTitle = document.createElement("span");
      folderTitle.className = this.id + "-item-header-prop-name";
      folderTitle.innerHTML = "Folder";

      const folderSelector = document.createElement("select");
      folderSelector.className = this.id + "-item-header-prop-value";
      for (let folder of Editor.project.getFolders(this.solutionId)) {
        let option = document.createElement("option");
        option.value = folder.getId();
        option.innerHTML = folder.getName();
        folderSelector.appendChild(option);
      }
      folderSelector.value = node.getFolder();
      folderSelector.onchange = () => {
        node.setFolder(folderSelector.value);
        Editor.onNodeUpdated(this.id, node);
        this.logInfo(`folder updated to ${folderSelector.value}.`);
      };

      const folderRow = document.createElement("row");
      folderRow.className = this.id + "-item-header-prop";
      folderRow.appendChild(folderTitle);
      folderRow.appendChild(folderSelector);
      rootElement.appendChild(folderRow);
    }

    const idTitle = document.createElement("div");
    idTitle.className = this.id + "-item-header-prop-name";
    idTitle.innerHTML = "Id";

    const idValue = document.createElement("div");
    idValue.className = this.id + "-item-header-prop-value";
    idValue.innerHTML = node.getId();

    const idRow = document.createElement("row");
    idRow.className = this.id + "-item-header-prop";
    idRow.appendChild(idTitle);
    idRow.appendChild(idValue);
    rootElement.appendChild(idRow);

    if (node.isRootNode) {
      const searchButton = document.createElement("icon");
      searchButton.classList.add("material-symbols-outlined");
      searchButton.classList.add(this.id + "-item-header-button");
      searchButton.innerText = "search";
      searchButton.setAttribute("title", "Find references");
      searchButton.onclick = () => Editor.doSearch(node.getId());
      idRow.appendChild(searchButton);
    }

    const separatorElement = document.createElement("div");
    separatorElement.className = this.id + "-item-header-separator";
    rootElement.appendChild(separatorElement);
  }

  buildComponentPropertyEditor(rootElement, node) {
    const holder = document.createElement("column");
    holder.className = this.id + "-table";
    rootElement.appendChild(holder);

    // Build a list with all Widgets, its actions, properties and widgets, composing this Component
    const widgets = [];
    const widgetNames = {};
    const widgetActionMap = {};
    const widgetPropertyMap = {};
    const widgetWidgetMap = {};
    const queue = [node];
    while (queue.length > 0) {
      let widget = queue.shift();
      let widgetId = widget.getId();
      let widgetName = widget.getName();
      if (widgetName && widgetId !== widgetName) {
        // For simplification, only named widgets will be available
        widgets.push(widget);
        widgetNames[widgetId] = widgetName;
        widgetActionMap[widgetId] = widget.getActionSchema();
        widgetPropertyMap[widgetId] = widget.getPropertySchema();
        widgetWidgetMap[widgetId] = widget.getWidgetSchema();
      }

      let children = widget.getWidgets();
      for (let key in children) {
        let keyVal = children[key];
        if (Array.isArray(keyVal)) {
          queue.push(...keyVal);
        } else {
          queue.push(keyVal);
        }
      }
    }

    // TODO: account for Components with other Components inside
    // show their exposed properties
    const props = node.exposedProperties;
    for (let key in props) {
      let row = this.createComponentPropertyEditorRow(props, key, widgetNames, widgetActionMap, widgetPropertyMap, widgetWidgetMap);
      holder.appendChild(row);
    }

    const addRow = this.createComponentPropertyEditorRow(props, null, widgetNames, widgetActionMap, widgetPropertyMap, widgetWidgetMap);
    holder.appendChild(addRow);
  }

  createComponentPropertyEditorRow(props, key, widgetNames, widgetActionMap, widgetPropertyMap, widgetWidgetMap) {
    const holder = document.createElement("row");
    holder.className = this.id + "-item";

    if (key) {
      const value = props[key];
      const keyElement = this.createPropertyNameElement(key, value !== null && value !== undefined);
      holder.append(keyElement);

      if (value) {
        // TODO: value should be something like <widgetId>.<type(action, property, widget)>.key
        // Replace widgetId with its name to be more user-friendly
        const parts = value.split(".");
        parts[0] = widgetNames[parts[0]] ?? parts[0];
        const valueElement = this.createPropertyNameElement(parts.join("."), true);
        holder.append(valueElement);
      } else {
        // 1. Select Widget (self or a child)
        // 2. Select:
        //    a property (no need no navigate through properties)
        //    a widget placeholder
        //    an action

        let finalValue;
        const selectWidget = () => {
          const selectWidgetList = [];
          for (let key in widgetNames) {
            selectWidgetList.push({id: key, name: widgetNames[key]});
          }
          showModalList(null, selectWidgetList, (val) => {
            finalValue = val.id;
            selectType(val.id);
          });
        };
        const selectType = (widgetId) => {
          const selectTypes = [];
          if (widgetPropertyMap[widgetId]) selectTypes.push("property");
          if (widgetWidgetMap[widgetId]) selectTypes.push("widget");
          if (widgetActionMap[widgetId]) selectTypes.push("action");
          showModalList(null, selectTypes, (val) => {
            finalValue += `.${val}`;
            switch(val) {
              case "property":
                selectKey(widgetPropertyMap[widgetId]);
                break;
              case "widget":
                selectKey(widgetWidgetMap[widgetId]);
                break;
              case "action":
                selectKey(widgetActionMap[widgetId]);
                break;
            }
          });
        };
        const selectKey = (map) => {
          showModalList(null, Object.keys(map), (val) => {
            finalValue += `.${val}`;
            props[key] = finalValue;
            Editor.onNodeUpdated(this.id, this.modelNode);
            this.selectNode(this.modelNode);
          });
        };

        const valueElement = document.createElement("input");
        valueElement.onclick = selectWidget;
        valueElement.value = key ? props[key] ?? null : null;
        valueElement.className = this.id + "-item-value";
        holder.append(valueElement);
      }
      
      const deleteElement = document.createElement("span");
      deleteElement.innerHTML = "delete";
      deleteElement.className = this.id + "-item-delete material-symbols-outlined";
      deleteElement.onclick = () => {
        delete props[key];
        this.selectNode(this.modelNode);
      };
      holder.append(deleteElement);
    } else {
      const keyElement = document.createElement("input");
      keyElement.className = this.id + "-item-value";
      keyElement.setAttribute("placeholder", "Add property");
      keyElement.onchange = () => {
        if (!keyElement.value) {
          return;
        }
        if (props.hasOwnProperty(keyElement.value)) {
          showModalError("Error", `Key '${keyElement.value}' already exists.`);
        } else {
          props[keyElement.value] = null;
          this.selectNode(this.modelNode);
        }
      };
      holder.append(keyElement);
    }

    return holder;
  }

  buildTypePropertyEditor(rootElement, node) {
    const holder = document.createElement("div");
    holder.className = this.id + "-table";
    rootElement.appendChild(holder);

    const props = node.properties;
    for (let key in props) {
      let row = this.createTypePropertyEditorRow(props, key);
      holder.appendChild(row);
    }

    // Empty row to add a new property
    const addRow = this.createTypePropertyEditorRow(props, null);
    holder.appendChild(addRow);
  }

  createTypePropertyEditorRow(props, key) {
    const holder = document.createElement("div");
    holder.className = this.id + "-item";

    if (!key) {
      const keyElement = document.createElement("input");
      keyElement.className = this.id + "-item-value";
      keyElement.setAttribute("placeholder", "Add property");
      keyElement.onchange = () => {
        if (keyElement.value) {
          props[keyElement.value] = null;
          this.selectNode(this.modelNode);
        }
      };
      holder.append(keyElement);
    } else {
      const value = props[key];
      const keyElement = this.createPropertyNameElement(key, value !== null && value !== undefined);
      holder.append(keyElement);

      const valueElement = document.createElement("input");
      valueElement.value = key ? props[key] ?? null : null;
      valueElement.className = this.id + "-item-value";
      valueElement.onchange = () => {
        this.logInfo(`${key} updated: ${props[key]} -> ${valueElement.value}.`);
        props[key] = valueElement.value;
        Editor.onNodeUpdated(this.id, this.modelNode);
      };
      holder.append(valueElement);

      const deleteElement = document.createElement("span");
      deleteElement.innerHTML = "delete";
      deleteElement.className = this.id + "-item-delete material-symbols-outlined";
      deleteElement.onclick = () => {
        delete props[key];
        this.selectNode(this.modelNode);
      };
      holder.append(deleteElement);
    }
    return holder;
  }

  createPropertyElement(rootElement, key, type, nodeProperties, template) {
    const holder = document.createElement("div");
    holder.className = this.id + "-item";
    rootElement.appendChild(holder);

    const value = nodeProperties[key];
    let isEmpty = value === null || value === undefined;
    if (!isEmpty) {
      if (Array.isArray(value)) {
        isEmpty = value.length === 0;
      } else if (value.constructor === Object) {
        isEmpty = Object.keys(value).length === 0;
      }
    }
    holder.appendChild(this.createPropertyNameElement(key, !isEmpty));
    const result = this.createPropertyValueElement(rootElement, key, type, nodeProperties, template);

    const elements = Array.isArray(result) ? result : [result];
    for (let i = 0; i < elements.length; i++) {
      holder.appendChild(elements[i]);
    }
  }

  createPropertyNameElement(name, hasValue) {
    const nameElement = document.createElement("label");
    nameElement.className = this.id + "-item-name ";
    if (hasValue)
      nameElement.className += this.id + "-item-name-filled";
    nameElement.innerHTML = name;
    return nameElement;
  }

  createPropertyValueElement(rootElement, key, type, nodeProperties, template) {
    if (Array.isArray(type)) {
      return this.createPropertyValueSelectElement(type, key, nodeProperties, template);
    }
    if (this.solutionSchema.properties[type] && this.solutionSchema.properties[type]["abstract"]) {
      return this.createPropertyValueCompoundSelectionElement(rootElement, type, key, nodeProperties, template);
    }
    const typeProperties = this.solutionSchema.getPropertyProperties(type);
    if (!typeProperties) {
      if (type === "Json") {
        return this.createPropertyValueJsonElement(rootElement, nodeProperties, key);
      } else {
        return this.createPropertyValueInputElement(type, key, nodeProperties, template);
      }
    }
    if (Array.isArray(typeProperties)) {
      return this.createPropertyValueSelectElement(typeProperties, key, nodeProperties, template);
    }

    const subElement = this.createPropertyValueCompoundElement(typeProperties, key, nodeProperties, template);
    subElement.style.display = "none";
    rootElement.appendChild(subElement);

    const valueElement = document.createElement("div");
    valueElement.className = this.id + "-item-expandable";
    valueElement.innerHTML = "+";
    valueElement.onclick = (e) => {
      if (subElement.style.display === "none") {
        subElement.style.display = null;
      } else {
        subElement.style.display = "none";
      }
    };
    return valueElement;
  }

  createPropertyValueCompoundElement(type, key, nodeProperties, template) {
    if (!nodeProperties[key]) {
      nodeProperties[key] = {};
    }
    const value = nodeProperties[key];
    const templateValue = template[key] ?? {};
    const valueElement = document.createElement("div");
    valueElement.className = this.id + "-subitem";
    const properties = type;
    for (const key in properties) {
      if (this.shouldShowProperty(properties[key])) {
        this.createPropertyElement(valueElement, key, properties[key], value, templateValue);
      }
    }
    return valueElement;
  }

  createNodeValueElement(node) {
    const valueElement = document.createElement("div");
    valueElement.className = this.id + "-subitem";

    let schema = node.getPropertySchema();
    for (let key in schema) {
      this.createPropertyElement(valueElement, key, schema[key], node.getProperties(), {});
    }
    schema = node.getActionSchema();
    for (let key in schema) {
      this.createPropertyElement(valueElement, key, schema[key], node.getActions(), {});
    }
    return valueElement;
  }

  createPropertyValueCompoundSelectionElement(rootElement, type, key, nodeProperties, template) {
    if (!nodeProperties[key]) {
      nodeProperties[key] = {};
    }

    const typeKey = "_type";
    const value = nodeProperties[key];
    const templateValue = template[key] ?? {};
    const isAction = this.solutionSchema.isAction(type);

    let valueElement;
    if (type === "KModel") {
      valueElement = this.createModelSelectElement(nodeProperties, key);
    } else  if (type === "KRequest") {
      valueElement = this.createRequestSelectElement(nodeProperties, key);
    } else {
      const propertyTypes = this.solutionSchema.getPropertyTypes(type);
      valueElement = this.createPropertyValueSelectElement(propertyTypes, typeKey, value, templateValue, (val) => {
        if (!isAction) {
          this.updateNodeValue(value, typeKey, val);
        } else {
          this.updateNodeValue(nodeProperties, key, new Action(this.solutionId, { "_type": val }));
        }
        this.selectNode(this.modelNode);
      });
    }

    if (value instanceof Node) {
      const subElement = this.createNodeValueElement(value);
      rootElement.appendChild(subElement);
    } else if (value[typeKey]) {
      const valueType = value[typeKey];
      const typeProperties = this.solutionSchema.getPropertyProperties(valueType);

      if (type !== "KRequest") {
        const subElement = this.createPropertyValueCompoundElement(typeProperties, key, nodeProperties, template);
        rootElement.appendChild(subElement);
      } else {
        // Add values from this Request object as Template values
        const filteredTypeProperties = {};
        const reqProps = Editor.project.getRequest(valueType)?.getProperties() ?? {};
        const typeTemplate = {};
        mergeMaps(typeTemplate, template);
        if (!typeTemplate[key]) {
          typeTemplate[key] = reqProps;
        }

        for (let reqKey in reqProps) {
          let reqVal = reqProps[reqKey];
          if (typeof reqVal === "object") {
            if (reqVal[typeKey]) {
              filteredTypeProperties[reqKey] = reqVal[typeKey];
            }
          } else {
            // filteredTypeProperties[reqKey] = typeProperties[typeKey];
          }

          // if (!templateValue.hasOwnProperty(reqKey)) {
          //   templateValue[reqKey] = reqProps[reqKey];
          // }
        }
        // template[key] = templateValue;

        const subElement = this.createPropertyValueCompoundElement(filteredTypeProperties, key, nodeProperties, typeTemplate);
        rootElement.appendChild(subElement);
      }
    }
    return valueElement;
  }

  createPropertyValueSelectElement(types, key, nodeProperties, template, onChange) {
    const valueElement = document.createElement("select");
    valueElement.className = this.id + "-item-value";

    let selectValue = document.createElement("option");
    selectValue.setAttribute("value", null);
    selectValue.innerHTML = template[key] ? template[key] + " (template)" : "";
    valueElement.appendChild(selectValue);

    for (const type of types) {
      selectValue = document.createElement("option");
      let name = typeof type === 'object' ? type.name : type;
      let value = typeof type === 'object' ? type.value : type;
      if (typeof name == "string") {
        name = name.replace("KAction", "").replace("KListAction", "").replace("KFormatter", "");
      }

      selectValue.setAttribute("value", value);
      selectValue.innerHTML = name;
      valueElement.appendChild(selectValue);
    }

    valueElement.value = nodeProperties[key] ?? null;
    valueElement.onchange = () => {
      if (!onChange) {
        this.updateNodeValue(nodeProperties, key, valueElement.value);
      } else {
        onChange(valueElement.value);
      }
    };
    return valueElement;
  }

  createPropertyValueInputElement(type, key, nodeProperties, template) {
    let valueElement;
    let value = nodeProperties[key] ?? null;
    const templateValue = template[key] ?? null;

    switch (type) {
      case "Bool":
        return this.createPropertyValueSelectElement([true, false], key, nodeProperties, template);
      case "Color":
        valueElement = document.createElement("input");
        // valueElement.setAttribute("type", "color");
        if (value && value.indexOf("$") < 0) {
          if (value && !value.startsWith("#")) {
            value = "#" + value;
          }
          if (value && value.startsWith("#") && (value.length == 4 || value.length == 7 || value.length == 9)) {
            valueElement.style.backgroundColor = value;
            valueElement.style.color = invertColor(value, true);
          }
        }
        break;
      case "Int":
      case "Double":
        valueElement = document.createElement("input");
        valueElement.setAttribute("type", "decimal");
        break;
      //case "Json":
      //  return this.createPropertyValueJsonElement(nodeProperties, key);
      case "KTemplate":
        return this.createTemplateSelectElement();
      case "KComponent":
        return this.createComponentSelectElement(nodeProperties, key);
      case "KModel":
        return this.createModelSelectElement(nodeProperties, key);
      case "KRequest":
        return this.createRequestSelectElement(nodeProperties, key);
      case "Screen":
        const screens = [];
        for (const screen of Editor.project.getScreens(this.solutionId)) {
          screens.push({ name: screen.getName(), value: screen.getId() });
        }
        const valueSelectElement = this.createPropertyValueSelectElement(screens, key, nodeProperties, template, (val) => {
          this.updateNodeValue(nodeProperties, key, val);
        });
        return this.wrapGotoNode(valueSelectElement, "screen");
      default:
        valueElement = document.createElement("input");
        break;
    }

    const changeFunc = (val) => {
      this.updateNodeValue(nodeProperties, key, val);
      valueElement.value = val;
    };

    valueElement.value = value ?? null;
    valueElement.className = this.id + "-item-value";
    valueElement.onchange = () => changeFunc(valueElement.value);
    valueElement.setAttribute("placeholder", templateValue ?? "");
    return this.wrapValueOptions(valueElement.value, valueElement, changeFunc);
  }

  createPropertyValueJsonElement(rootElement, nodeProperties, key) {
    const value = nodeProperties[key];
    const editor = document.createElement("textarea");
    editor.className = this.id + "-item-value";
    editor.value = value != null ? stringify(value) : "";
    editor.onchange = () => {
      try {
        const obj = JSON.parse(editor.value);
        this.updateNodeValue(nodeProperties, key, obj);
      } catch (ex) {
        alert(ex);
      }
    };

    const editorHolder = document.createElement("div");
    editorHolder.className = this.id + "-item";
    editorHolder.appendChild(editor);
    rootElement.appendChild(editorHolder);

    return document.createElement("div");
  }

  createTemplateSelectElement() {
    const valueElement = document.createElement("select");
    valueElement.className = this.id + "-item-value";

    let selectValue = document.createElement("option");
    selectValue.setAttribute("value", null);
    valueElement.appendChild(selectValue);

    const widgetTypes = this.solutionSchema.getWidgetInheritance(this.modelNode.getType());
    for (let type of widgetTypes) {
      let templateList = Editor.project.findTemplates(this.solutionId, type);
      for (let val of templateList) {
        selectValue = document.createElement("option");
        selectValue.setAttribute("value", val.getId());
        selectValue.innerHTML = val.getName();
        valueElement.appendChild(selectValue);
      }
    }

    valueElement.value = this.modelNode.getTemplate()?.getId() ?? null;
    valueElement.onchange = () => {
      this.modelNode.setTemplate(valueElement.value);
      Editor.onNodeUpdated(this.id, this.modelNode);
      this.logInfo(`template updated to ${valueElement.value}.`);
    };

    return this.wrapGotoNode(valueElement, "template");
  }

  createComponentSelectElement(node, key) {
    const valueElement = document.createElement("select");
    valueElement.className = this.id + "-item-value";

    for (let component of Editor.project.getComponents(this.solutionId)) {
      let selectValue = document.createElement("option");
      selectValue.setAttribute("value", component.getId());
      selectValue.innerHTML = component.getName();
      valueElement.appendChild(selectValue);
    }

    valueElement.value = node[key];
    valueElement.onchange = () => this.updateNodeValue(node, key, valueElement.value);

    return this.wrapGotoNode(valueElement, "component");
  }

  wrapGotoNode(valueElement, nodeType) {
    const gotoButton = document.createElement("span");
    gotoButton.className = "property-panel-option-button material-symbols-outlined";
    gotoButton.innerHTML = "forward";
    gotoButton.onclick = () => {
      let node;
      if (valueElement.value) {
        switch (nodeType) {
          case "template":
            node = Editor.project.getTemplate(valueElement.value);
            break;
          case "component":
            node = Editor.project.getComponent(valueElement.value);
            break;
          case "screen":
            node = Editor.project.getScreen(valueElement.value);
            break;
          default:
            return;
        }
        if (node) {
          Editor.selectNode(node);
        }
      }
    };

    const valueHolder = document.createElement("row");
    valueHolder.classList.add(this.id + "-item-value");
    valueHolder.appendChild(valueElement);
    valueHolder.appendChild(gotoButton);
    return valueHolder;
  }

  wrapValueOptions(value, child, changeFunc) {
    const options = [
      { name: "none", title: "Free text.", },
      { name: "state", template: "${state.{0}}", title: "A Screen has a 'state' Map. You can use a key of that map as the value for this property.", },
      { name: "entry", template: "${entry.{0}}", title: "An 'entry' Map is available for Widgets that are children of a ListWidget. An 'entry' is a member of the array provided to the ListWidget.", },
      { name: "env", template: "${env.{0}}", title: "Use an environment variable as a value for this property.", },
      { name: "global", template: "${global.{0}}", title: "The App has a global Map. You can use a key of that map as the value for this property.", },
    ];

    let currentOption = options[0];
    const optionLabel = document.createElement("span");
    optionLabel.classList.add("highlightedColor");

    const optionInput = document.createElement("input");
    optionInput.className = this.id + "-item-value";
    optionInput.onchange = () => changeFunc(currentOption.template.replace("{0}", optionInput.value));

    const selectFunc = (option) => {
      currentOption = option;
      optionLabel.innerHTML = option.name;

      const childClass = currentOption.name === "none" ? "show" : "hide";
      const optionClass = currentOption.name === "none" ? "hide" : "show";
      child.classList.remove(optionClass);
      optionLabel.classList.remove(childClass);
      optionInput.classList.remove(childClass);
      child.classList.add(childClass);
      optionLabel.classList.add(optionClass);
      optionInput.classList.add(optionClass);

      optionInput.setAttribute("list", `${option.name}-datalist`);
    };

    const selectButton = document.createElement("label");
    selectButton.className = "property-panel-option-button material-symbols-outlined";
    selectButton.innerHTML = "more_vert";
    selectButton.title = "Value options";
    selectButton.onclick = () => showModalList(null, options, (op) => {
      optionInput.value = "";
      selectFunc(op);
    });

    const valueHolder = document.createElement("row");
    valueHolder.classList.add(this.id + "-item-value");
    valueHolder.appendChild(child);
    valueHolder.appendChild(optionLabel);
    valueHolder.appendChild(optionInput);
    valueHolder.appendChild(selectButton);

    if (value && value.split("$").length === 2) {
      for (let option of options) {
        if (!option.template) {
          continue;
        }

        let leading = option.template.split(".")[0];
        if (value.indexOf(leading + ".") === 0 && value.endsWith("}")) {
          currentOption = option;
          optionInput.value = value.replace(leading + ".", "").replace("}", "");
          break;
        }
      }
    }
    selectFunc(currentOption);

    return valueHolder;
  }

  createModelSelectElement(node, key) {
    const valueElement = document.createElement("select");
    valueElement.className = this.id + "-item-value";

    for (let entry of Editor.project.getModels(this.solutionId)) {
      let selectValue = document.createElement("option");
      selectValue.setAttribute("value", entry.getId());
      selectValue.innerHTML = entry.getName();
      valueElement.appendChild(selectValue);
    }

    valueElement.value = node[key]?._type;
    valueElement.onchange = () => {
      this.updateNodeValue(node, key, { "_type": valueElement.value });
      this.selectNode(this.modelNode);
    };
    return valueElement;
  }

  createRequestSelectElement(node, key) {
    const valueElement = document.createElement("select");
    valueElement.className = this.id + "-item-value";

    for (let entry of Editor.project.getRequests(this.solutionId)) {
      let selectValue = document.createElement("option");
      selectValue.setAttribute("value", entry.getId());
      selectValue.innerHTML = entry.getName();
      valueElement.appendChild(selectValue);
    }

    valueElement.value = node[key]?._type;
    valueElement.onchange = () => {
      this.updateNodeValue(node, key, { "_type": valueElement.value });
      this.selectNode(this.modelNode);
    };
    return valueElement;
  }

  updateNodeValue(nodeProperties, key, value) {
    if (value === "null" || value === "undefined") {
      value = null;
    }
    this.logInfo(`${key} updated: ${nodeProperties[key]} -> ${value}.`);
    nodeProperties[key] = value;
    Editor.onNodeUpdated(this.id, this.modelNode);
  }

  shouldShowProperty(type) {
    return !this.solutionSchema.isWidget(type) && !this.solutionSchema.isAction(type);
  }

  logInfo(message) {
    Editor.logInfo(`[PropertyPanel] '${this.modelNode.getName() || this.modelNode.getType()}' ${message}`, this.modelNode);
  }
}



class ActionPanel extends PropertyPanel{
  constructor() {
    super();
    this.id = "action-panel";
  }

  selectNode(node) {
    this.modelNode = node;
    this.solutionId = node.getSolutionId();

    const schemaActions = node.getActionSchema() ?? {};
    const nodeActions = node.getActions();
    const template = {}; // (node instanceof Widget ? node.getTemplate() : {}) ?? {};

    const rootPanel = document.getElementById(this.id);
    rootPanel.innerHTML = "";
    this.buildHeader(rootPanel, node);

    for (let key in schemaActions) {
      this.createPropertyElement(rootPanel, key, schemaActions[key], nodeActions, template);
    }
  }

  shouldShowProperty(type) {
    return !this.solutionSchema.isWidget(type);
  }
}

class TestPanel extends EditorPanel {
  constructor() {
    super();
    this.id = "test-panel";
  }

  populate() {
    document.getElementById(this.id).innerHTML = "";
  }

  selectNode(node) {
    const rootPanel = document.getElementById(this.id);
    if (!(node instanceof RootNode)) {
      return;
    }

    rootPanel.innerHTML = "";

    const mockState = Editor.project.getTestData(node.getId()) || "{\n}";
    const mockStateLabel = document.createElement("span");
    mockStateLabel.innerText = "Set a mock data for this screen to help you design and test it without needing to go through a series of actions to reach this screen with the proper data.";
    rootPanel.appendChild(mockStateLabel);
    
    const mockStateEl = document.createElement("textarea");
    mockStateEl.value = mockState;
    mockStateEl.onchange = () => {
      try {
        if (mockStateEl.value) {
          JSON.parse(mockStateEl.value);
        }
        Editor.project.setTestData(node.getId(), mockStateEl.value);
      } catch (ex) {
        alert(ex);
      }
    };
    rootPanel.appendChild(mockStateEl);

    const lastState = window.localStorage.getItem(node.getId()) || "{\n}";
    const lastStateAction = document.createElement("a");
    lastStateAction.innerText = " here ";
    lastStateAction.onclick = () => {
      Editor.project.setTestData(node.getId(), lastState);
      mockStateEl.value = lastState;
    };
    const lastStateLabelEnd = document.createElement("span");
    lastStateLabelEnd.innerText = " to set it as mock data.";
    const lastStateLabel = document.createElement("span");
    lastStateLabel.innerText = "The last known state for this screen. Click ";
    lastStateLabel.appendChild(lastStateAction);
    lastStateLabel.appendChild(lastStateLabelEnd);
    rootPanel.appendChild(lastStateLabel);

    const lastStateEl = document.createElement("textarea");
    lastStateEl.setAttribute("disabled", "disabled");
    lastStateEl.value = lastState;
    rootPanel.appendChild(lastStateEl);
  }
}

class JsonPanel extends EditorPanel {
  constructor() {
    super();
    this.id = "json-panel";
  }

  populate() {
    document.getElementById(this.id).innerHTML = "";
  }

  onNodeUpdated(origin, node, screen) {
    this.selectNode(node);
  }

  selectNode(node) {
    const rootPanel = document.getElementById(this.id);
    rootPanel.innerHTML = "";

    const editor = document.createElement("textarea");
    editor.className = "json-panel-editor";
    editor.value = stringify(node);
    editor.onchange = (v) => { this.updateNode(editor.value, node); };
    rootPanel.appendChild(editor);
  }
  updateNode(json, node) {
    try {
      const obj = JSON.parse(json);
      node.fromObject(obj);
      Editor.onNodeUpdated(this.id, node);
    } catch (ex) {
      alert(ex);
    }
  }
}

class SolutionPanel extends EditorPanel {
  constructor() {
    super();
    this.id = "solution-panel";
    this.cssId = "solution-panel";
    this.visibilityState = {};
  }

  selectNode(node) {
    const nodeId = node?.getId();
    if (!node.isRootNode) {
      return;
    }

    const rootPanel = document.getElementById(this.id);
    const elements = rootPanel.getElementsByClassName(this.cssId + "-item-selected");
    for (let child of elements) {
      child.classList.remove(this.cssId + "-item-selected");
    }

    const element = rootPanel.querySelectorAll('[node-id="' + nodeId + '"]');
    if (element && element.length > 0) {
      element[0].classList.add(this.cssId + "-item-selected");
    }
  }

  onNodeCreated(origin, node) {
    if (node.isRootNode) {
      this.populate();
      this.selectNode(node);
    }
  }

  onNodeUpdated(origin, node) {
    if (node.isRootNode) {
      this.populate();
      this.selectNode(node);
    }
  }

  onNodeDeleted(origin, node) {
    if (node.isRootNode) {
      this.populate();
      this.selectNode(node);
    }
  }

  populate() {
    const rootPanel = document.getElementById(this.id);
    rootPanel.innerHTML = "";

    for (let solution of Editor.project.solutions) {
      this.populateSolution(rootPanel, solution);
    }
  }

  populateSolution(rootPanel, solution) {
    const solutionId = solution.getId();
    let visible = !this.visibilityState[solutionId];
    const childHolder = document.createElement("column");
    childHolder.className = this.cssId + "-item-holder";

    const toggleFunc = () => {
      if (visible) {
        delete this.visibilityState[solutionId];
        childHolder.classList.remove("hide");
        toggleElement.innerHTML = "expand_more";
      } else {
        this.visibilityState[solutionId] = true;
        childHolder.classList.add("hide");
        toggleElement.innerHTML = "navigate_next";
      }
    };

    const toggleElement = document.createElement("span");
    toggleElement.className = "screen-panel-item-toggler material-symbols-outlined";
    toggleElement.innerHTML = "expand_more";
    toggleElement.onclick = (e) => {
      visible = !visible;
      toggleFunc();
      e.stopPropagation();
    };

    const name = document.createElement("span");
    name.classList.add(this.cssId + "-item-name");
    name.classList.add(this.cssId + "-solution-name");
    name.innerHTML = solution.name ?? solutionId;

    const actionIcon = document.createElement("span");
    actionIcon.className = this.cssId + "-item-action material-symbols-outlined";
    actionIcon.innerHTML = "add";
    actionIcon.onclick = () => this.onCreateNewNode(solution);

    const row = document.createElement("div");
    row.classList.add(this.cssId + "-item-solution");
    row.setAttribute("node-id", solutionId);
    row.appendChild(toggleElement);
    row.appendChild(name);
    row.appendChild(actionIcon);

    rootPanel.appendChild(row);
    rootPanel.appendChild(childHolder);
    toggleFunc();

    const folderMap = {};
    const folders = [...solution.folders];
    while (folders.length > 0) {
      let folder = folders[0];
      if (!folder.getFolder()) {
        let folderHolder = this.createNodeItem(childHolder, solution, folder, "folder");
        folderMap[folder.getId()] = folderHolder;
        folders.splice(0, 1);
      } else if (folderMap[folder.getFolder()]) {
        let folderHolder = this.createNodeItem(folderMap[folder.getFolder()], solution, folder, "folder");
        folderMap[folder.getId()] = folderHolder;
        folders.splice(0, 1);
      } else {
        folders.splice(0, 1);
        folders.push(folder);
      }
    }

    const nodesToPopulate = this.getNodesToPopulate(solution);
    const nodeTypeArrays = nodesToPopulate.types;
    const nodeArrays = nodesToPopulate.nodes;

    for (let i = 0; i < nodeArrays.length; i++) {
      let array = nodeArrays[i];
      let type = nodeTypeArrays[i];
      if (array) {
        for (let node of array) {
          let folder = node.getFolder();
          if (!folder || !folderMap[folder]) {
            this.createNodeItem(childHolder, solution, node, type);
          } else {
            this.createNodeItem(folderMap[folder], solution, node, type);
          }
        }
      }
    }

    if (childHolder.children.length === 0) {
      const noEntriesElement = this.buildNoEntriesMessage(solution);
      childHolder.appendChild(noEntriesElement);
    }
  }

  buildNoEntriesMessage(solution) {
    const nodes = this.getNodesToPopulate(solution).types[0];
    const holder = document.createElement("column");
    holder.classList.add(this.cssId + "-no-entries");
    holder.innerText = `No '${nodes}s' yet.\nClick here to create your first.`;
    holder.onclick = () => this.onCreateNewNode(solution);
    return holder;
  }

  getNodesToPopulate(solution) {
    return {
      types: ["screen"],
      nodes: [solution.screens]
    };
  }

  createNodeItem(parentElement, solution, node, type) {
    const icon = document.createElement("span");
    icon.className = this.cssId + "-item-icon material-symbols-outlined";
    switch (type) {
      case "folder":
        icon.innerHTML = "folder_open";
        break;
      case "model":
        icon.innerHTML = "assignment";
        break;
      case "request":
        icon.innerHTML = "cloud";
        break;
      case "screen":
        icon.innerHTML = "phone_iphone";
        break;
      case "template":
        icon.innerHTML = "style";
        break;
      case "component":
        icon.innerHTML = "layers";
        break;
    }

    const name = document.createElement("span");
    name.className = this.cssId + "-item-name";
    name.innerHTML = node.getName() ?? node.getId();

    const row = document.createElement("row");
    row.className = this.cssId + "-item";
    row.setAttribute("node-id", node.getId());
    row.addEventListener("click", () => this.onNodeClick(node));
    row.addEventListener("dblclick", () => this.onNodeDoubleClick(node));
    row.appendChild(icon);
    row.appendChild(name);
    parentElement.appendChild(row);

    const buttonHolder = document.createElement("row");
    buttonHolder.className = this.cssId + "-item-actions";
    row.appendChild(buttonHolder);

    if (solution.canMoveUp(type, node)) {
      const upButton = document.createElement("span");
      upButton.className = this.cssId + "-item-action material-symbols-outlined";
      upButton.innerHTML = "arrow_upward";
      upButton.title = "Move upward";
      upButton.onclick = () => {
        solution.moveRootNode(type, node, "up");
        Editor.onNodeUpdated(this.id, node);
      };
      buttonHolder.appendChild(upButton);
    }

    if (solution.canMoveDown(type, node)) {
      const downButton = document.createElement("span");
      downButton.className = this.cssId + "-item-action material-symbols-outlined";
      downButton.innerHTML = "arrow_downward";
      downButton.title = "Move downward";
      downButton.onclick = () => {
        solution.moveRootNode(type, node, "down");
        Editor.onNodeUpdated(this.id, node);
      };
      buttonHolder.appendChild(downButton);
    }

    if (type !== "folder") {
      const cloneButton = document.createElement("span");
      cloneButton.className = this.cssId + "-item-action material-symbols-outlined";
      cloneButton.innerHTML = "add_to_photos";
      cloneButton.title = "Clone this " + type;
      cloneButton.onclick = () => {
        const newNode = solution.cloneRootNode(type, node);
        if (newNode) {
          Editor.onNodeCreated(this.id, newNode);
        }
      };
      buttonHolder.appendChild(cloneButton);
    }

    if (Editor.project.solutions.length > 1) {
      const changeSolutionButton = document.createElement("span");
      changeSolutionButton.className = this.cssId + "-item-action material-symbols-outlined";
      changeSolutionButton.innerHTML = "swap_vertical_circle";
      changeSolutionButton.title = "Move to another Solution";
      changeSolutionButton.onclick = () => {
        this.changeSolution(solution, type, node);
      };
      buttonHolder.appendChild(changeSolutionButton);
    }
    
    const deleteButton = document.createElement("span");
    deleteButton.className = this.cssId + "-item-action material-symbols-outlined";
    deleteButton.innerHTML = "delete";
    deleteButton.title = "Remove";
    deleteButton.onclick = () => {
      if (confirm("Remove this " + type + "?")) {
        solution.removeRootNode(type, node);
        Editor.onNodeDeleted(this.id, node);
      }
    };
    buttonHolder.appendChild(deleteButton);

    if (type === "folder") {
      const childHolder = document.createElement("div");
      childHolder.className = this.cssId + "-item-holder";
      
      let visible = !this.visibilityState[node.getId()];
      const toggleElement = document.createElement("span");
      toggleElement.className = "screen-panel-item-toggler material-symbols-outlined";

      const toggleFunc = () => {
        if (visible) {
          delete this.visibilityState[node.getId()];
          childHolder.classList.remove("hide");
          toggleElement.innerHTML = "expand_more";
        } else {
          this.visibilityState[node.getId()] = true;
          childHolder.classList.add("hide");
          toggleElement.innerHTML = "navigate_next";
        }
      };

      const outerRow = document.createElement("row");
      outerRow.classList.add(this.cssId + "-item-folder");
      outerRow.appendChild(toggleElement);
      outerRow.appendChild(row);
      parentElement.appendChild(outerRow);
      parentElement.appendChild(childHolder);

      toggleElement.innerHTML = "expand_more";
      toggleElement.onclick = (e) => {
        visible = !visible;
        toggleFunc();
        e.stopPropagation();
      };
      toggleFunc();

      return childHolder;
    }
  }

  changeSolution(currentSolution, type, node) {
    const options = [];
    for (let sol of Editor.project.solutions) {
      if (sol.id !== currentSolution.id) {
        options.push({
          "id": sol.id,
          "name": sol.name,
        });
      }
    }
    if (options === 0) {
      return;
    }

    const tailFunction = (solutionId) => {
      Editor.project.changeSolution(type, node, solutionId);
      Editor.onNodeUpdated(this.id, node);
    };

    if (options.length === 1) {
      if (confirm(`Move ${type} ${node.getName()} to ${options[0].name}?`)) {
        tailFunction(options[0].id);
      }
    } else {
      showModalList(null, options, (v) => tailFunction(v.id));
    }
  }

  onCreateNewNode(solution) {
    const types = this.getNodesToPopulate(solution).types;
    showModalList(null, types.concat(["folder"]), (v) => {
      switch (v.toLowerCase()) {
        case "template":
        case "component":
          const schema = Editor.project.getSchema(solution.getId());
          const types = schema.getWidgetsOfType(null);
          showModalList(null, types, (selectedType) => {
            this.createNode(solution, v, selectedType);
          });
          break;
        default:
          return this.createNode(solution, v);
      }
    });
  }

  createNode(solution, type, prop) {
    const nameInput = document.createElement("input");
    nameInput.setAttribute("placeholder", "Name the new " + type);

    const noFolder = document.createElement("option");
    noFolder.value = "";
    noFolder.innerHTML = "Select a folder for the new " + type;
    noFolder.setAttribute("disabled", "disabled");
    noFolder.setAttribute("hidden", "hidden");
    noFolder.setAttribute("selected", "selected");
    const folderSelector = document.createElement("select");
    folderSelector.appendChild(noFolder);
    for (let folder of Editor.project.getFolders(solution.id)) {
      let option = document.createElement("option");
      option.value = folder.getId();
      option.innerHTML = folder.getName();
      folderSelector.appendChild(option);
    }

    const column = document.createElement("column");
    column.style.setProperty("gap", "10px");
    column.appendChild(nameInput);
    column.appendChild(folderSelector);

    showModalForm("New " + type, column, () => {
      let newNode;
      switch (type.toLowerCase()) {
        case "screen":
          newNode = solution.createScreen();
          break;
        case "template":
          newNode = solution.createTemplate(prop);
          break;
        case "component":
          newNode = solution.createComponent(prop);
          break;
        case "model":
          newNode = solution.createType("KModel");
          break;
        case "request":
          newNode = solution.createType("KRequest");
          break;
        case "folder":
          newNode = solution.createFolder();
          break;
        default:
          return;
      }
  
      if (newNode) {
        if (nameInput.value) {
          newNode.setName(nameInput.value);
        }
        if (folderSelector.value) {
          newNode.setFolder(folderSelector.value);
        }
        Editor.onNodeCreated(this.id, newNode);
        if (type.toLowerCase() !== "folder") {
          Editor.selectNode(newNode);
        }
      }
    });
    nameInput.focus();
  }

  onNodeClick(node) {
    Editor.selectNode(node);
  }

  onNodeDoubleClick(screen) {
  }

  static onToolbarClick(idx) {
    // SolutionPanel.onToolbarSetVisibility(true);
    const toolbar = document.getElementById("solution-tabs-buttons");
    for (let child of toolbar.children) {
      child.classList.remove("collapsible-tabs-button-selected");
    }
    toolbar.children[idx].classList.add("collapsible-tabs-button-selected");

    const panelHolder = document.getElementById("explorer-tabs-panels");
    for (let child of panelHolder.children)
      child.classList.add("hidden");
    panelHolder.children[idx].classList.remove("hidden");
  }

  static onToolbarOver(idx) {
    SolutionPanel.onToolbarClick(idx);
  }

  static onToolbarToggle() {
    const panel = document.getElementById("explorer-tabs");
    SolutionPanel.onToolbarSetVisibility(panel.classList.contains("collapsible-tabs-collapsed"));
  }

  static onToolbarSetVisibility(visible = true) {
    const panel = document.getElementById("explorer-tabs");
    const toggler = document.getElementById("solution-tabs-toggler");
    if (visible)
    {
      toggler.innerHTML = "chevron_left";
      panel.classList.remove("collapsible-tabs-collapsed");
      
    }
    else
    {
      toggler.innerHTML = "chevron_right";
      panel.classList.add("collapsible-tabs-collapsed");
    }
  }
}


class TemplatePanel extends SolutionPanel {
  constructor() {
    super();
    this.id = "template-panel";
  }

  getNodesToPopulate(solution) {
    return {
      types: ["template"],
      nodes: [solution.templates]
    };
  }
}


class ComponentPanel extends SolutionPanel {
  constructor() {
    super();
    this.id = "component-panel";
  }

  getNodesToPopulate(solution) {
    return {
      types: ["component"],
      nodes: [solution.components]
    };
  }
}


class TypePanel extends SolutionPanel {
  constructor() {
    super();
    this.id = "type-panel";
  }

  getNodesToPopulate(solution) {
    return {
      types: ["model", "request"],
      nodes: [
        solution.types.filter(e => e.extends === "KModel"),
        solution.types.filter(e => e.extends === "KRequest")
      ]
    };
  }
}
class ScreenPanel extends EditorPanel {
  constructor() {
    super();
    this.id = "screen-panel";
    this.node;
    this.visibilityState = {};
    this.injectedStyles = {};
    window.setTimeout(() => this.rebuildFrame(), 100);
  }

  populate() {
    const rootPanel = document.getElementById(this.id);
    rootPanel.innerHTML = "";
    const flutterPanel = document.getElementById("flutter-panel");
    flutterPanel.onVisible = () => document.getElementById("flutter-panel-toolbar").classList.remove("hidden");
    flutterPanel.onInvisible = () => document.getElementById("flutter-panel-toolbar").classList.add("hidden");
    this.node = null;
    this.solutionId = null;
    this.solutionSchema = null;
  }

  onNodeUpdated(origin, node, screen) {
    if (screen?.getId() === this.node?.getId() || node.getId() === this.node?.getId()) {
      this.internalSelectNode(this.node);
    }
    this.internalSelectNode(Editor.selectedNode);
  }

  selectNode(node) {
    if (node.getId() == this.node?.getId()) {
      return;
    }
    this.internalSelectNode(node);
  }

  internalSelectNode(node) {
    if (node instanceof Screen) {
      this.node = node;
      this.solutionId = node.getSolutionId();
      this.solutionSchema = Editor.project.getSchema(this.solutionId);
      this.buildScreen(node);
    } else if (node instanceof Component) {
      this.node = node;
      this.solutionId = node.getSolutionId();
      this.solutionSchema = Editor.project.getSchema(this.solutionId);
      this.buildComponent(node);
    }

    if (node instanceof Widget) {
      const rootElement = document.getElementById(this.id);
      const children = rootElement.getElementsByClassName(this.id + "-item-selected");
      for (let child of children) {
        child.classList.remove(this.id + "-item-selected");
      }

      const selectedChild = rootElement.getElementsByClassName(node.getId());
      if (selectedChild.length > 0) {
        selectedChild[0].classList.add(this.id + "-item-selected");
      }
    }
  }

  buildScreen(screen) {
    const rootElement = document.getElementById(this.id);
    rootElement.innerHTML = "";
    if (screen.getBody()) {
      this.buildWidget(screen, "body", rootElement);
    } else {
      const screenPlaceholder = { key: "body", type: "RootWidget" };
      const widgetTypes = this.solutionSchema.getWidgetsOfType("RootWidget");
      
      const message = document.createElement("span");
      message.classList.add(this.id + "-root-message");
      message.innerText = "Select your root widget:";

      const holder = document.createElement("column");
      holder.classList.add(this.id + "-root");
      holder.appendChild(message);
      rootElement.appendChild(holder);

      const buildWidgetTypeButton = (widgetType) => {
        const button = document.createElement("span");
        button.innerText = widgetType.name;
        button.classList.add(this.id + "-root-select");
        button.onclick = () => {
          this.createWidget(widgetType, screen, screenPlaceholder);
        };
        holder.appendChild(button);
      };
      for (let type of widgetTypes) {
        buildWidgetTypeButton({ type: type, name: type });
      }
    }
  }

  buildComponent(component) {
    const rootElement = document.getElementById(this.id);
    rootElement.innerHTML = "";
    const dummyScreen = new Screen(component.getSolutionId());
    dummyScreen.setBody(component);
    this.buildWidget(dummyScreen, "body", rootElement, null, true);
  }

  buildWidget(parentWidget, parentKey, parentElement, idx, isRoot) {
    const keyValue = parentWidget.getWidget(parentKey);
    const isArray = Array.isArray(keyValue);
    const widget = isArray ? keyValue[idx] : keyValue;

    const toggleElement = document.createElement("span");
    toggleElement.className = this.id + "-item-toggler material-symbols-outlined";

    const iconElement = document.createElement("span");
    iconElement.className = this.id + "-item-icon material-symbols-outlined";
    iconElement.innerHTML = getIconForWidget(widget.getType());

    let title;
    let subtitle;
    const relevantProperties = [
      widget.getName(),
      widget.getProperty("alias"),
      widget.getTemplate()?.getName() ?? widget.getType(),
      !parentKey.includes("child") ? parentKey : null,
    ];
    for (let prop of relevantProperties) {
      if (prop != null) {
        if (!title) {
          title = prop;
        } else {
          subtitle = prop;
          break;
        }
      }
    }

    const titleElement = document.createElement("span");
    titleElement.className = this.id + "-item-title";
    titleElement.innerHTML = title;

    const subtitleElement = document.createElement("span");
    subtitleElement.className = this.id + "-item-subtitle";
    subtitleElement.innerHTML = subtitle ?? "";

    const nameElement = document.createElement("div");
    nameElement.className = this.id + "-item-name";
    nameElement.appendChild(titleElement);
    nameElement.appendChild(subtitleElement);

    const element = document.createElement("div");
    element.className = this.id + "-item";
    if (widget.getId())
      element.classList.add(widget.getId());
    element.onclick = () => Editor.selectNode(widget);
    element.appendChild(toggleElement);
    element.appendChild(iconElement);
    element.appendChild(nameElement);
    parentElement.appendChild(element);

    const addWidgetKeys = [];
    const properties = widget.getWidgetSchema();
    const childrenHolder = [];
    if (properties) {
      const configDropEvents = (elem) => {
        elem.ondragenter = () => elem.classList.add(`${this.id}-item-children-drop-over`);
        elem.ondragleave = (e) => {
          if (!childOf(e.fromElement, elem)) {
            elem.classList.remove(`${this.id}-item-children-drop-over`);
          }
        };
      };

      for (let key in properties) {
        const type = properties[key];
        if (type.startsWith("[")) {
          let arrayProperty = widget.getWidget(key);
          addWidgetKeys.push({ key, type, hasValue: arrayProperty !== null && arrayProperty !== undefined });
          if (arrayProperty) {
            const childHolder = document.createElement("column");
            childHolder.classList.add(`${this.id}-item-children`);
            childHolder.classList.add(`${this.id}-item-children-${type.replace("[", "").replace("]", "")}`);
            configDropEvents(childHolder);
            childrenHolder.push(childHolder);

            let i;
            for (i = 0; i < arrayProperty.length; i++) {
              childHolder.appendChild(this.buildDropSeparator(widget, key, type, i));
              this.buildWidget(widget, key, childHolder, i);
            }
            childHolder.appendChild(this.buildDropSeparator(widget, key, type, i));
          }
        } else {
          if (widget.getWidget(key)) {
            const childHolder = document.createElement("div");
            childHolder.className = this.id + "-item-children";
            childrenHolder.push(childHolder);
            this.buildWidget(widget, key, childHolder);
          } else {
            addWidgetKeys.push({ key, type });
          }
        }
      }
    }

    if (childrenHolder.length > 0) {
      for (let childHolder of childrenHolder) {
        parentElement.appendChild(childHolder);
      }

      let visible = !this.visibilityState[widget.getId()];
      const toggleFunc = () => {
        if (visible) {
          delete this.visibilityState[widget.getId()];
          for (let childHolder of childrenHolder) {
            childHolder.classList.remove("hide");
          }
          toggleElement.innerHTML = "expand_more";
        } else {
          this.visibilityState[widget.getId()] = true;
          for (let childHolder of childrenHolder) {
            childHolder.classList.add("hide");
          }
          toggleElement.innerHTML = "navigate_next";
        }
      };

      toggleElement.innerHTML = "expand_more";
      toggleElement.onclick = (e) => {
        visible = !visible;
        toggleFunc();
        e.stopPropagation();
      }
      toggleFunc();
    }

    // Build toolbar
    const options = [];
    const buttonHolder = document.createElement("div");
    buttonHolder.className = this.id + "-item-actions";
    element.appendChild(buttonHolder);

    if (!isRoot && widget.isOfType("Widget")) {
      // const wrapButton = document.createElement("span");
      // wrapButton.className = this.id + "-item-action material-symbols-outlined";
      // wrapButton.innerHTML = "crop_free";
      // wrapButton.title = "Add a Widget around this Widget";
      // wrapButton.onclick = () => {
      //   this.selectWrappableWidgetType(widget, parentWidget, parentKey);
      // }
      // buttonHolder.appendChild(wrapButton);
      options.push({
        icon: "crop_free",
        name: "Add a Widget around this Widget",
        func: () => this.selectWrappableWidgetType(widget, parentWidget, parentKey)
      });
    }

    if (isArray) {
      if (idx > 0) {
        const upButton = document.createElement("span");
        upButton.className = this.id + "-item-action material-symbols-outlined";
        upButton.innerHTML = "arrow_upward";
        upButton.title = "Move this widget upward";
        upButton.onclick = () => {
          keyValue.splice(idx, 1);
          keyValue.splice(idx - 1, 0, widget);
          Editor.onNodeUpdated(this.id, this.node);
        };
        buttonHolder.appendChild(upButton);
      }

      if (idx < keyValue.length - 1) {
        const downButton = document.createElement("span");
        downButton.className = this.id + "-item-action material-symbols-outlined";
        downButton.innerHTML = "arrow_downward";
        downButton.title = "Move this widget downward";
        downButton.onclick = () => {
          keyValue.splice(idx, 1);
          keyValue.splice(idx + 1, 0, widget);
          Editor.onNodeUpdated(this.id, this.node);
        };
        buttonHolder.appendChild(downButton);
      }

      // const cloneButton = document.createElement("span");
      // cloneButton.className = this.id + "-item-action material-symbols-outlined";
      // cloneButton.innerHTML = "add_to_photos";
      // cloneButton.title = "Clone this widget";
      // cloneButton.onclick = () => {
      //   keyValue.push(widget.clone());
      //   Editor.onNodeUpdated(this.id, this.node);
      // }
      // buttonHolder.appendChild(cloneButton);
      options.push({
        icon: "add_to_photos",
        name: "Clone this widget",
        func: () => {
          const widgetClone = widget.clone();
          keyValue.push(widgetClone);
          Editor.onNodeUpdated(this.id, this.node);
          Editor.logInfo(`[ScreenPanel] New Widget '${widgetClone.getType()}' created as '${parentWidget.getName() || parentWidget.getId()}''s '${parentKey}'.`, widgetClone, parentWidget, this.node);
        }
      });
    }

    if (addWidgetKeys.length > 0) {
      this.configDropZones(widget, addWidgetKeys, element);
      const addButton = document.createElement("span");
      addButton.className = this.id + "-item-action material-symbols-outlined";
      addButton.innerHTML = "add";
      addButton.title = "Add a new Widget";
      addButton.onclick = () => this.selectAddAction(addWidgetKeys, widget);
      buttonHolder.appendChild(addButton);
    }

    if (!isRoot) {
      options.push({
        icon: "content_copy",
        name: "Copy this Widget",
        func: () => Editor.clipboardPut(widget)
      });

      options.push({
        icon: "delete",
        name: "Remove this Widget",
        func: () => {
          if (!confirm("Remove this Widget?")) {
            return;
          }
          if (isArray) {
            keyValue.splice(idx, 1);
          } else {
            parentWidget.setWidget(parentKey, null);
          }
          Editor.onNodeUpdated(this.id, this.node);
          Editor.logInfo(`[ScreenPanel] Widget '${widget.getName() || widget.getId()}' removed from '${parentWidget.getName() || parentWidget.getId()}''s '${parentKey}'.`, widget, parentWidget, this.node);
        }
      });
    }

    const optionsButton = document.createElement("span");
    optionsButton.className = this.id + "-item-action material-symbols-outlined";
    optionsButton.innerHTML = "more_vert";
    optionsButton.title = "More options";
    optionsButton.onclick = () => showModalList(null, options, (option) => option.func());
    buttonHolder.appendChild(optionsButton);
  }

  buildDropSeparator(widget, key, type, idx) {
    const rootType = type.replace("[", "").replace("]", "");
    const separator = document.createElement("div");
    separator.appendChild(document.createElement("div"));
    separator.classList.add(`${this.id}-drop-separator`);
    separator.classList.add(`${this.id}-drop-separator-${rootType}`);
    separator.ondragenter = () => separator.classList.add(`${this.id}-drop-separator-over`);
    separator.ondragleave = () => separator.classList.remove(`${this.id}-drop-separator-over`);
    separator.ondragover = (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "copy";
    }
    separator.ondrop = (ev) => {
      const draggedType = ev.dataTransfer.getData("text");
      this.createWidget({ type: draggedType }, widget, { key, type, idx });
    };
    return separator;
  }

  configDropZones(widget, dropZones, element) {
    if (!dropZones || dropZones.length === 0) {
      return;
    }

    element.ondragenter = () => element.classList.add(`${this.id}-item-drop-over`);
    element.ondragleave = (e) => {
      if (!childOf(e.fromElement, element)) {
        element.classList.remove(`${this.id}-item-drop-over`);
      }
    };

    const dropZoneHolderMap = {};
    const createZone = (zone) => {
      const rootType = zone.type.replace("[", "").replace("]", "");
      if (!dropZoneHolderMap[rootType]) {
        const dropZoneHolder = document.createElement("column");
        dropZoneHolder.classList.add(`${this.id}-drop-zones`);
        dropZoneHolder.classList.add(`${this.id}-drop-zones-${rootType}`);
        element.appendChild(dropZoneHolder);
        dropZoneHolderMap[rootType] = dropZoneHolder;
      }

      const dropZone = document.createElement("span");
      dropZone.classList.add(`${this.id}-drop-zone`);
      dropZone.classList.add(`${this.id}-drop-zone-${rootType}`);
      dropZone.innerText = zone.key;
      dropZone.ondragenter = () => dropZone.classList.add(`${this.id}-drop-zone-over`);
      dropZone.ondragleave = () => dropZone.classList.remove(`${this.id}-drop-zone-over`);
      dropZone.ondragover = (ev) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "copy";
      }
      dropZone.ondrop = (ev) => {
        const draggedType = ev.dataTransfer.getData("text");
        this.createWidget({ type: draggedType }, widget, zone);
      };
      dropZoneHolderMap[rootType].appendChild(dropZone);
    };

    for (let entry of dropZones) {
      if (entry.hasValue) {
        continue;
      }

      let rootType = entry.type.replace("[", "").replace("]", "");
      element.classList.add(`${this.id}-item-${rootType}`);

      let styleKey = `.widget-drag-${rootType}`;
      if (!this.injectedStyles[styleKey]) {
        // Style widget
        let style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.innerHTML = `${styleKey} .${this.id}-item-${rootType} {
          border: 1px dashed;
          border-radius: 4px;
        }`;
        document.getElementsByTagName("head")[0].appendChild(style);

        // Style widget drop zones
        style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.innerHTML = `${styleKey} .${this.id}-item-${rootType}.${this.id}-item-drop-over > .${this.id}-drop-zones-${rootType} {
          height: auto;
        }`;
        document.getElementsByTagName("head")[0].appendChild(style);

        // Style children holder
        style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.innerHTML = `${styleKey} .${this.id}-item-children-${rootType} {
          border: 1px dashed;
          border-radius: 4px;
        }`;
        document.getElementsByTagName("head")[0].appendChild(style);

        // Style children holder's drop separators
        style = document.createElement("style");
        style.setAttribute("type", "text/css");
        style.innerHTML = `${styleKey} .${this.id}-item-children-${rootType}.${this.id}-item-children-drop-over > .${this.id}-drop-separator-${rootType} {
          --border-width: 1px;
          padding: 5px 10px;
        }`;
        document.getElementsByTagName("head")[0].appendChild(style);

        this.injectedStyles[styleKey] = true;
      }

      createZone(entry);
    }
  }

  selectAddAction(options, parentWidget) {
    if (options.length > 1) {
      showModalList(null, options.map(o => o.key), (selectedKey) => {
        this.selectWidgetType(parentWidget, options.find((o) => o.key === selectedKey));
      }, "Select a Widget placing");
    } else {
      this.selectWidgetType(parentWidget, options[0]);
    }
  }

  selectWidgetType(parentWidget, option) {
    const types = [];
    const widgetTypes = this.solutionSchema.getWidgetsOfType(option.type);

    const clipboardObj = Editor.clipboardGet();
    if (clipboardObj && clipboardObj instanceof Widget && clipboardObj.isOfType(option.type)) {
      types.push({ type: "_clipboard", name: "(copied) " + clipboardObj.getType() });
    }

    for (let type of widgetTypes) {
      types.push({ type: type, name: type });

      let components = Editor.project.findComponents(this.solutionId, type);
      if (components) {
        for (let component of components) {
          types.push({ type: type, name: "&emsp;Link to " + component.getName(), component: component.getId() });
        }
      }

      let templates = Editor.project.findTemplates(this.solutionId, type);
      if (templates) {
        for (let template of templates) {
          types.push({ type: type, name: "&emsp;" + template.getName(), template: template.getId() });
        }
      }
    }

    showModalList(null, types, (selectedType) => {
      this.createWidget(selectedType, parentWidget, option);
    }, "Select a Widget type");
  }

  createWidget(selectedType, parentWidget, option) {
    const key = option.key;
    const type = option.type;
    let newWidget;
    if (selectedType.component) {
      newWidget = Widget.create(parentWidget.getSolutionId(), "WidgetComponent");
      newWidget.setProperty("component", selectedType.component);
    } else {
      newWidget = selectedType.type === "_clipboard"
        ? Editor.clipboardGet().clone()
        : Widget.create(parentWidget.getSolutionId(), selectedType.type);

      if (selectedType.template) {
        newWidget.setTemplate(selectedType.template);
      }
    }

    if (type.startsWith("[")) {
      if (!parentWidget.getWidget(key)) {
        parentWidget.setWidget(key, []);
      }
      const list = parentWidget.getWidget(key);
      if (option.idx !== null && option.idx !== undefined) {
        list.splice(option.idx, 0, newWidget);
      } else {
        list.push(newWidget);
      }
    } else {
      parentWidget.setWidget(key, newWidget);
    }
    Editor.onNodeUpdated(this.id, this.node);
    Editor.logInfo(`[ScreenPanel] New Widget '${newWidget.getType()}' created as '${parentWidget.getName() || parentWidget.getId()}''s '${key}'.`, newWidget, parentWidget, this.node);
  }

  selectWrappableWidgetType(widget, parentWidget, key) {
    const types = this.solutionSchema.getWidgetsWithProperties("Widget", ["child", "children"], "Widget");
    showModalList(null, types, (selectedType) => {
      this.wrapWidget(widget, parentWidget, key, selectedType);
    });
  }

  wrapWidget(widget, parentWidget, key, widgetType) {
    const newWidget = Widget.create(widget.getSolutionId(), widgetType);
    const keyValue = parentWidget.getWidget(key);

    if (Array.isArray(keyValue)) {
      const idx = keyValue.indexOf(widget);
      keyValue.splice(idx, 1, newWidget);
    } else {
      parentWidget.setWidget(key, newWidget);
    }

    const typeSchema = newWidget.getWidgetSchema();
    if (typeSchema.hasOwnProperty("child")) {
      newWidget.setWidget("child", widget);
    } else if (typeSchema.hasOwnProperty("children")) {
      newWidget.setWidget("children", [widget]);
    }

    Editor.onNodeUpdated(this.id, this.node);
    Editor.logInfo(`[ScreenPanel] New Widget '${newWidget.getType()}' created as '${parentWidget.getName() || parentWidget.getId()}''s '${key}'.`, newWidget, parentWidget, this.node);
  }

  frameFull() {
    const frame = document.getElementById("flutter-panel-frame");
    frame.setAttribute("width", "100%");
    frame.setAttribute("height", "100%");
  }

  framePhone() {
    const frame = document.getElementById("flutter-panel-frame");
    frame.setAttribute("width", "400px");
    frame.setAttribute("height", "800px");
  }

  frameTablet() {
    const frame = document.getElementById("flutter-panel-frame");
    frame.setAttribute("width", "800px");
    frame.setAttribute("height", "600px");
  }

  frameWidth(v) {
    const frame = document.getElementById("flutter-panel-frame");
    frame.setAttribute("width", v + "px");
  }

  frameHeight(v) {
    const frame = document.getElementById("flutter-panel-frame");
    frame.setAttribute("height", v + "px");
  }

  async frameReload() {
    const frame = document.getElementById("flutter-panel-frame");
    frame.setAttribute("src", "");
    await fetch("rebuild", { method: "GET", });
    this.rebuildFrame();
  }

  rebuildFrame() {
    const frame = document.getElementById("flutter-panel-frame");
    frame.src = "/index.html?ts=" + Date.now().toString();
    frame.contentWindow.location.href = frame.src;
    // frame.setAttribute("src", "/index.html?ts=" + Date.now().toString());
    frame.setAttribute("name", Date.now().toString());
  }
}

class NavigationPanel extends EditorPanel {
    constructor() {
        super();
        this.id = "navigation-panel";
        this.rootNode = null;
        this.gridHandler = null;
        this.screenToElement = {};
        this.screenToSvgPath = {};
        this.widgetToSvgPath = {};
        this.gridSize = 300;
        this.router;
    }

    populate() {
        this.clearGrid();
        this.rootNode = null;
        document.getElementById(this.id).onVisible = () => this.rebuild();
    }

    selectNode(node) {
        if (node instanceof Widget) {
            this.selectSvg(this.widgetToSvgPath[node.getId()]);
        }

        if (!(node instanceof Screen)) {
            return;
        }

        if (this.screenToElement[node.getId()]) {
            // selected screen exists in the grid
            this.rootNode = node;
            for (let screenId of Object.keys(this.screenToElement)) {
                let element = this.screenToElement[screenId];
                element.classList.remove(this.id + "-screenHolder-selected");
                if (screenId === node.getId()) {
                    element.classList.add(this.id + "-screenHolder-selected");
                }
            }

            for (let screenId of Object.keys(this.screenToSvgPath)) {
                var list = this.screenToSvgPath[screenId];
                for (let path of list) {
                    path.classList.remove(this.id + "-grid-svg-selected");
                    if (screenId === node.getId()) {
                        path.classList.add(this.id + "-grid-svg-selected");
                    }
                }
            }

            return;
        }

        this.rootNode = node;
        this.rebuild();
    }

    rebuild() {
        this.clearGrid();
        if (this.rootNode) {
            this.buildScreen(this.rootNode, null, null);
        }
    }

    onNodeUpdated(origin, node, rootNode) {
        // TODO: make sure all events have a rootNode, otherwise it wont be possible to know if a rebuild is needed
        if (this.rootNode && rootNode instanceof Screen && this.screenToElement[rootNode.getId()]) {
            this.rebuild();
        }
    }

    onNodeDeleted(origin, node, rootNode) {
        this.onNodeUpdated(origin, node, rootNode);
    }

    buildScreen(screen, parentScreen, actionType) {
        if (!screen || this.screenToElement[screen.getId()]) {
            // Screen already exists
            return;
        }

        const screenHolder = document.createElement("div");
        screenHolder.className = this.id + "-screenHolder";
        screenHolder.classList.add(this.id + "-screenHolder-" + (actionType ?? "KActionNavigate"));
        if (screen.getId() === this.rootNode.getId()) {
            screenHolder.classList.add(this.id + "-screenHolder-selected");
        }
        screenHolder.onclick = () => Editor.selectNode(screen);

        this.appendToGrid(screenHolder, screen, parentScreen);
        this.screenToElement[screen.getId()] = screenHolder;

        const screenName = document.createElement("div");
        screenName.className = this.id + "-screenName";
        screenName.innerHTML = screen.getName() ?? screen.getId();
        screenHolder.appendChild(screenName);

        const childHolder = document.createElement("div");
        childHolder.className = this.id + "-childHolder";
        screenHolder.appendChild(childHolder);

        const typeDecoration = document.createElement("div");
        typeDecoration.className = this.id + "-decoration";
        screenHolder.appendChild(typeDecoration);

        this.buildWidget(screen, screen.getBody(), childHolder);
    }

    buildWidget(screen, widget, element) {
        if (!widget) {
            return;
        }

        const actions = widget.getActions();
        for (let key of Object.keys(actions)) {
            this.handleAction(screen, widget, key, actions[key], element);
        }

        const type = widget.getType().toLowerCase();
        const widgetsToIgnore = [];
        if (type === "scaffold" || type === "sliverscaffold") {
            // Since a Scaffold can have global navigation like a drawer or a navigationBar,
            // every screen would show the entire app navigation instead of the navigation related to the
            // current screen. To avoid this information overload, lets ignore those widgets.
            widgetsToIgnore.push("drawer", "navigationRail", "bottomNavigationBar");
        }

        const widgets = widget.getWidgets();
        for (let key of Object.keys(widgets)) {
            if (widgetsToIgnore.indexOf(key) >= 0) {
                continue;
            }
            let value = widgets[key];
            if (value instanceof Widget) {
                this.buildWidget(screen, value, element);
            } else if (Array.isArray(value)) {
                for (let child of value) {
                    this.buildWidget(screen, child, element);
                }
            }
        }

        const componentId = widget.getProperty("component");
        if (componentId) {
            const component = Editor.project.getComponent(componentId);
            this.buildWidget(screen, component, element);
        }
    }

    handleAction(screen, widget, widgetKey, action, element) {
        if (!action || !action.getType) {
            return;
        }

        let screenId = action.getProperty("jumpToScreen") ?? action.getProperty("jumpToRoute");
        if (screenId) {
            let linkedScreen = Editor.project.getScreen(screenId);
            if (linkedScreen) {
                let widgetElement = this.buildWidgetAction(widget, widgetKey, element);
                this.buildScreen(linkedScreen, screen, action.getType());
                let svg = this.linkScreens(widgetElement, screen, linkedScreen);
                this.widgetToSvgPath[widget.getId()] = svg;
            }
        } else {
            const actions = action.getActions();
            for (let key of Object.keys(actions)) {
                this.handleAction(screen, widget, widgetKey, actions[key], element);
            }
        }
    }

    buildWidgetAction(widget, actionKey, element) {
        const name = document.createElement("div");
        name.className = this.id + "-widget-name";
        name.innerHTML = widget.getName() ?? widget.getType();

        const event = document.createElement("div");
        event.className = this.id + "-widget-event";
        event.innerHTML = actionKey;

        const holder = document.createElement("div");
        holder.className = this.id + "-widget-holder";
        holder.onclick = (e) => {
            window.setTimeout(() => Editor.selectNode(widget));
            // Editor.selectNode(widget);
            // e.stopPropagation();
        };
        holder.appendChild(name);
        holder.appendChild(event);
        element.appendChild(holder);
        return holder;
    }

    appendToGrid(screenHolder, screen, parentScreen) {
        const pos = this.gridHandler.getNextPosition(screen, parentScreen);
        screenHolder.style.left = (pos.x * this.gridSize) + "px";
        screenHolder.style.top = (pos.y * this.gridSize) + "px";
        this.gridHandler.holder.appendChild(screenHolder);
    }

    linkScreens(widgetElement, fromScreen, toScreen) {
        const elementWidth = 136;
        const elementHeight = 240;
        const widgetHeight = widgetElement.offsetHeight;
        const fromPos = this.gridHandler.getNodePosition(fromScreen);
        const toPos = this.gridHandler.getNodePosition(toScreen);

        let fromX = fromPos.x <= toPos.x ? 0 : (fromPos.x - toPos.x) * this.gridSize;
        let fromY = (fromPos.y <= toPos.y ? 0 : (fromPos.y - toPos.y) * this.gridSize) + widgetElement.offsetTop;
        let toX = toPos.x <= fromPos.x ? 0 : (toPos.x - fromPos.x) * this.gridSize;
        let toY = toPos.y <= fromPos.y ? 0 : (toPos.y - fromPos.y) * this.gridSize;

        const startAttributes = {
            code: fromScreen.getId(),
            left: fromX,
            right: fromX + elementWidth,
            top: fromY,
            bottom: fromY + widgetHeight,
            xIndex: fromPos.x,
            yIndex: fromPos.y
        };
        const finishAttributes = {
            code: toScreen.getId(),
            left: toX,
            right: toX + elementWidth,
            top: toY,
            bottom: toY + elementHeight,
            xIndex: toPos.x,
            yIndex: toPos.y
        };
        const pathString = this.router.getRoute(startAttributes, finishAttributes);

        const width = Math.max(fromX, toX) - Math.min(fromX, toX) + elementWidth;
        const height = Math.max(fromY, toY) - Math.min(fromY, toY) + elementHeight;
        const extraMargin = 40;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add(this.id + "-grid-svg");
        if (fromScreen.getId() === this.rootNode.getId()) {
            svg.classList.add(this.id + "-grid-svg-selected");
        }
        svg.setAttribute("width", (width + extraMargin) + "px");
        svg.setAttribute("height", (height + extraMargin) + "px");
        svg.style.left = (Math.min(fromPos.x, toPos.x) * this.gridSize) + "px";
        svg.style.top = (Math.min(fromPos.y, toPos.y) * this.gridSize) + "px";
        svg.style.position = "absolute";

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add(this.id + "-grid-line");
        path.setAttribute("d", pathString);
        path.onclick = (e) => {
            this.selectSvg(svg);
            e.stopPropagation();
        };
        svg.appendChild(path);

        if (!this.screenToSvgPath[fromScreen.getId()]) {
            this.screenToSvgPath[fromScreen.getId()] = [];
        }
        this.screenToSvgPath[fromScreen.getId()].push(svg);

        this.gridHandler.holder.appendChild(svg);
        return svg;
    }

    clearGrid() {
        this.router = new Routing();
        this.screenToElement = {};
        this.screenToSvgPath = {};
        this.widgetToSvgPath = {};
        const gridHolder = document.getElementById(this.id + "-grid");
        gridHolder.innerHTML = "";
        this.gridHandler = new Grid(gridHolder);
    }

    selectSvg(selectedSvg) {
        for (let screenId of Object.keys(this.screenToSvgPath)) {
            var list = this.screenToSvgPath[screenId];
            for (let svg of list) {
                svg.classList.remove(this.id + "-grid-svg-selected");
            }
        }
        if (selectedSvg) {
            selectedSvg.classList.add(this.id + "-grid-svg-selected");
        }
    }
}

class FlowPanel extends EditorPanel {
    constructor() {
        super();
        this.id = "flow-panel";
        this.rootNode = null;
        this.solutionId = null;
        this.widgetToElement = {};
        this.actionToElement = {};
        this.actionToSvgPath = {};
        this.gridSize = 200;
        this.router;
    }

    populate() {
        this.clearGrid();
        this.rootNode = null;
        this.solutionId = null;
        this.solutionSchema = null;
        document.getElementById(this.id).onVisible = () => this.rebuild();
    }

    selectNode(node) {
        this.updateSelectedNode(node);
        if (node instanceof Screen) {
            this.clearGrid();
            this.rootNode = node;
            this.solutionId = node.getSolutionId();
            this.solutionSchema = Editor.project.getSchema(this.solutionId);
            this.buildScreen(this.rootNode);
        } else if (node instanceof Component) {
            this.clearGrid();
            this.rootNode = node;
            this.solutionId = node.getSolutionId();
            this.solutionSchema = Editor.project.getSchema(this.solutionId);
            this.buildComponent(this.rootNode);
        } else if (node instanceof Widget) {
            const element = this.widgetToElement[node.getId()];
            if (element) {
                element.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                // element.scrollIntoViewIfNeeded();
            }
        }
    }

    rebuild() {
        const rootElement = document.getElementById(this.id);
        const scrollTop = rootElement.parentElement.scrollTop;
        this.clearGrid();
        if (this.rootNode instanceof Screen) {
            this.buildScreen(this.rootNode);
        } else if (this.rootNode instanceof Component) {
            this.buildComponent(this.rootNode);
        }
        this.selectNode(Editor.selectedNode);
        rootElement.parentElement.scrollTop = scrollTop;
    }

    onNodeUpdated(origin, node, rootNode) {
        this.rebuild();
    }

    onNodeDeleted(origin, node, rootNode) {
        this.onNodeUpdated(origin, node, rootNode);
    }

    buildScreen(screen) {
        this.buildRootActions(screen);
        this.buildWidget(screen.getBody());
    }

    buildComponent(component) {
        this.buildWidget(component);
    }

    buildWidget(widget) {
        if (!widget) {
            return;
        }
        this.buildRootActions(widget);
        const widgets = widget.getWidgets();
        for (let key of Object.keys(widgets)) {
            let value = widgets[key];
            if (value instanceof Widget) {
                this.buildWidget(value);
            } else if (Array.isArray(value)) {
                for (let child of value) {
                    this.buildWidget(child);
                }
            }
        }
    }

    buildRootActions(node) {
        const gridHolder = document.getElementById(this.id + "-grid-holder");
        const actions = node.getActionSchema();
        if (!actions || Object.keys(actions).length === 0) {
            return;
        }

        if (!(node instanceof Screen)) {
            const nodeInfoHolder = document.createElement("div");
            nodeInfoHolder.classList.add(this.id + "-nodeInfo");
            nodeInfoHolder.innerHTML = node.getName() ?? node.getType();
            nodeInfoHolder.onclick = () => Editor.selectNode(node);
            gridHolder.appendChild(nodeInfoHolder);
            this.widgetToElement[node.getId()] = nodeInfoHolder;
        }

        for (let key of Object.keys(actions)) {
            let actionHolder = document.createElement("div");
            actionHolder.classList.add(this.id + "-rootAction-holder");
            gridHolder.appendChild(actionHolder);

            let actionName = document.createElement("div");
            actionName.classList.add(this.id + "-rootAction-name");
            actionName.innerHTML = key;
            actionHolder.appendChild(actionName);

            let action = node.actions[key];
            if (action instanceof Action) {
                let actionGrid = document.createElement("div");
                actionGrid.classList.add(this.id + "-action-grid");
                let actionGridHolder = document.createElement("div");
                actionGridHolder.classList.add(this.id + "-action-gridHolder");
                actionGridHolder.appendChild(actionGrid);
                actionHolder.appendChild(actionGridHolder);

                this.buildAction(new Grid(actionGrid), action, node);
            } else {
                let addAction = document.createElement("div");
                addAction.classList.add(this.id + "-rootAction-add");
                addAction.classList.add("material-symbols-outlined");
                addAction.innerHTML = "add_circle";
                addAction.onclick = () => {
                    this.selectActionType(node, key);
                };
                actionName.appendChild(addAction);
            }
        }
    }

    buildAction(grid, action, parentNode) {
        const actionHolder = document.createElement("div");
        actionHolder.classList.add(this.id + "-action-holder");
        actionHolder.onclick = () => Editor.selectNode(action);
        this.appendToGrid(grid, actionHolder, action, parentNode instanceof Action ? parentNode : null);
        this.actionToElement[action.getId()] = actionHolder;

        let actionName
        if (action.getType() === "KActionRequest" || action.getType() === "KListActionRequest") {
            const requestData = action.getProperty("request");
            if (requestData) {
                const request = Editor.project.getRequest(requestData["_type"]);
                actionName = request?.getName();;
            }
        }
        actionName ??= action.getType().replace("KAction", "").replace("KListAction", "");

        const typeName = document.createElement("div");
        typeName.classList.add(this.id + "-actionName");
        typeName.innerHTML = actionName;
        actionHolder.appendChild(typeName);

        const actionActionsHolder = document.createElement("div");
        actionActionsHolder.classList.add(this.id + "-action-actions-holder");
        actionHolder.appendChild(actionActionsHolder);

        const nextActionsKeys = [];
        const nextActions = action.getActionSchema();
        for (let key of Object.keys(nextActions)) {
            let nextAction = action.actions[key];
            if (nextAction instanceof Action) {
                let propertyElement = document.createElement("div");
                propertyElement.classList.add(this.id + "-action-property");
                propertyElement.innerHTML = key;
                actionHolder.appendChild(propertyElement);

                this.buildAction(grid, nextAction, action);
                let svg = this.linkActions(grid, propertyElement, action, nextAction);
                propertyElement.onclick = () => window.setTimeout(() => this.selectSvg(svg));
            } else {
                nextActionsKeys.push(key);
            }
        }

        if (nextActionsKeys.length > 0) {
            const addActionElement = document.createElement("div");
            addActionElement.classList.add("material-symbols-outlined");
            addActionElement.classList.add(this.id + "-action-actions-item");
            addActionElement.innerHTML = "add";
            addActionElement.onclick = (e) => {
                this.addAction(action, nextActionsKeys);
                e.stopPropagation();
            };
            actionActionsHolder.appendChild(addActionElement);
        }

        const deleteActionElement = document.createElement("div");
        deleteActionElement.classList.add("material-symbols-outlined");
        deleteActionElement.classList.add(this.id + "-action-actions-item");
        deleteActionElement.innerHTML = "delete";
        deleteActionElement.onclick = (e) => {
            const node = parentNode ?? this.rootNode;
            for (let key of Object.keys(node.actions)) {
                if (node.actions[key] === action) {
                    delete node.actions[key];
                    Editor.onNodeUpdated(this.id, this.rootNode);
                    Editor.logInfo(`[FlowPanel] Action '${action.getType()}' removed from '${parentNode.getName() || parentNode.getType()}'.`, action, parentNode, this.rootNode);
                }
            }
            e.stopPropagation();
        };
        actionActionsHolder.appendChild(deleteActionElement);
    }

    appendToGrid(grid, actionHolder, action, parentNode) {
        const pos = grid.getNextPosition(action, parentNode);
        actionHolder.style.left = (pos.x * this.gridSize) + "px";
        actionHolder.style.top = (pos.y * this.gridSize) + "px";
        grid.holder.appendChild(actionHolder);

        // Update grid height
        grid.holder.style.height = (pos.y * this.gridSize + actionHolder.offsetHeight) + "px";
    }

    linkActions(grid, actionElement, fromAction, toAction) {
        const elementWidth = 106;
        const elementHeight = 106;
        const widgetHeight = actionElement.offsetHeight;
        const fromPos = grid.getNodePosition(fromAction);
        const toPos = grid.getNodePosition(toAction);

        let fromX = fromPos.x <= toPos.x ? 0 : (fromPos.x - toPos.x) * this.gridSize;
        let fromY = (fromPos.y <= toPos.y ? 0 : (fromPos.y - toPos.y) * this.gridSize) + actionElement.offsetTop;
        let toX = toPos.x <= fromPos.x ? 0 : (toPos.x - fromPos.x) * this.gridSize;
        let toY = toPos.y <= fromPos.y ? 0 : (toPos.y - fromPos.y) * this.gridSize;

        const startAttributes = {
            code: fromAction.getId(),
            left: fromX,
            right: fromX + elementWidth,
            top: fromY,
            bottom: fromY + widgetHeight,
            xIndex: fromPos.x,
            yIndex: fromPos.y
        };
        const finishAttributes = {
            code: toAction.getId(),
            left: toX,
            right: toX + elementWidth,
            top: toY,
            bottom: toY + elementHeight,
            xIndex: toPos.x,
            yIndex: toPos.y
        };
        const pathString = this.router.getRoute(startAttributes, finishAttributes);

        const width = Math.max(fromX, toX) - Math.min(fromX, toX) + elementWidth;
        const height = Math.max(fromY, toY) - Math.min(fromY, toY) + elementHeight;
        const extraMargin = 40;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add(this.id + "-action-grid-svg");
        if (fromAction.getId() === this.rootNode.getId()) {
            svg.classList.add(this.id + "-action-grid-svg-selected");
        }
        svg.setAttribute("width", (width + extraMargin) + "px");
        svg.setAttribute("height", (height + extraMargin) + "px");
        svg.style.left = (Math.min(fromPos.x, toPos.x) * this.gridSize) + "px";
        svg.style.top = (Math.min(fromPos.y, toPos.y) * this.gridSize) + "px";
        svg.style.position = "absolute";

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add(this.id + "-action-grid-line");
        path.setAttribute("d", pathString);
        // path.onclick = (e) => {
        //     this.selectSvg(svg);
        //     e.stopPropagation();
        // };
        svg.appendChild(path);

        if (!this.actionToSvgPath[fromAction.getId()]) {
            this.actionToSvgPath[fromAction.getId()] = [];
        }
        this.actionToSvgPath[fromAction.getId()].push(svg);

        grid.holder.appendChild(svg);
        return svg;
    }

    addAction(action, options) {
        if (options.length > 1) {
            showModalList(null, options, (selectedKey) => {
                this.selectActionType(action, selectedKey);
            });
        } else {
            this.selectActionType(action, options[0]);
        }
    }

    selectActionType(node, key) {
        const baseType = node.getActionSchema()[key];
        const actionTypes = this.solutionSchema.getActionTypes(baseType);
        const types = [];
        for (let type of actionTypes) {
            types.push({ "type": type, "name": type.replace("KAction", "").replace("KListAction", "") });
        }

        showModalList(null, types, (option) => {
            const newAction = new Action(this.rootNode.getSolutionId(), { "_type": option.type });
            node.actions[key] = newAction;
            Editor.onNodeUpdated(this.id, this.rootNode);
            Editor.logInfo(`[FlowPanel] Action '${option.type}' created and linked to '${node.getName() || node.getType()}'.`, newAction, node, this.rootNode);
        });
    }

    selectSvg(selectedSvg) {
        for (let actionId of Object.keys(this.actionToSvgPath)) {
            var list = this.actionToSvgPath[actionId];
            for (let svg of list) {
                svg.classList.remove(this.id + "-action-grid-svg-selected");
            }
        }
        if (selectedSvg) {
            selectedSvg.classList.add(this.id + "-action-grid-svg-selected");
        }
    }

    updateSelectedNode(node) {
        for (let nodeId of Object.keys(this.widgetToElement)) {
            let element = this.widgetToElement[nodeId];
            element.classList.remove(this.id + "-nodeInfo-selected");
            if (nodeId === node.getId()) {
                element.classList.add(this.id + "-nodeInfo-selected");
            }
        }

        for (let actionId of Object.keys(this.actionToElement)) {
            let element = this.actionToElement[actionId];
            element.classList.remove(this.id + "-actionHolder-selected");
            if (actionId === node.getId()) {
                element.classList.add(this.id + "-actionHolder-selected");
            }
        }

        for (let actionId of Object.keys(this.actionToSvgPath)) {
            var list = this.actionToSvgPath[actionId];
            for (let path of list) {
                path.classList.remove(this.id + "-action-grid-svg-selected");
                if (actionId === node.getId()) {
                    path.classList.add(this.id + "-action-grid-svg-selected");
                }
            }
        }
    }

    clearGrid() {
        this.router = new Routing();
        this.widgetToElement = {};
        this.actionToElement = {};
        this.actionToSvgPath = {};
        document.getElementById(this.id + "-grid-holder").innerHTML = "";
    }
}

class ConsolePanel extends EditorPanel {
    constructor() {
        super();
        this.id = "console-panel";
        this.followTail = true;
    }

    onMouseEnter() {
        if (!this.logPanel)
            this.buildPanel();
        this._scrollToEnd();
    }

    buildPanel() {
        this.logPanel = document.getElementById(this.id + "-logs");
        this.logPanel.innerHTML = "";
        // document.getElementById(this.id).onmouseleave = () => this._scrollToEnd();
        this._buildToolbar();
    }

    onLog(logMessage) {
        if (!this.logPanel)
            this.buildPanel();

        const type = this._getLogType(logMessage.type ?? "info");
        const origin = logMessage.origin?.toLowerCase();

        const logData = this._buildLogData(logMessage);
        logData.classList.add(this.id + "-level-" + type);
        logData.classList.add(this.id + "-origin-" + origin);

        const logRow = document.createElement("row");
        logRow.classList.add(this.id + "-logLine");
        logRow.classList.add(this.id + "-level-" + type);
        logRow.classList.add(this.id + "-origin-" + origin);
        logRow.classList.add(this.id + "-logLine-" + type);
        logRow.classList.add(this.id + "-logLine-" + origin);
        if (logData.hasChildNodes()) {
            logRow.classList.add(this.id + "-hasData");
        }

        const message = document.createElement("span");
        message.innerText = logMessage.message;
        logRow.append(message);

        // Update status control
        const statusControl = document.getElementById("footer-panel-status");
        statusControl.innerHTML = "";
        statusControl.append(logRow.cloneNode(true));

        logRow.onclick = () => {
            const selectedRows = this.logPanel.getElementsByClassName(this.id + "-logLine-selected");
            for (let row of selectedRows) {
                row.classList.remove(this.id + "-logLine-selected");
            }
            logRow.classList.add(this.id + "-logLine-selected");
            if (logData.hasChildNodes()) {
                logData.classList.toggle("hidden");
            }
        };

        this.logPanel.appendChild(logRow);
        this.logPanel.appendChild(logData);
        
        let children = this.logPanel.getElementsByClassName(this.id + "-logLine");
        while (children.length > 200) {
            this.logPanel.children[0].remove();
            this.logPanel.children[0].remove();
            children = this.logPanel.getElementsByClassName(this.id + "-logLine");
        }

        this._scrollToEnd();
        this._filterLogs(this.searchInput.value);
    }

    _buildLogData(logMessage) {
        const logData = document.createElement("column");
        logData.classList.add(this.id + "-logData");
        logData.classList.add("hidden");

        if (logMessage.error || logMessage.stackTrace) {
            const logErrorHolder = document.createElement("column");
            logErrorHolder.classList.add(this.id + "-logData-error");
            logData.appendChild(logErrorHolder);
            if (logMessage.error) {
                const logError = document.createElement("span");
                logError.innerHTML = logMessage.error;
                logErrorHolder.appendChild(logError);
            }
            if (logMessage.stackTrace) {
                const logStack = document.createElement("span");
                logStack.innerHTML = logMessage.stackTrace.replaceAll("\n", "<br>");
                logErrorHolder.appendChild(logStack);
            }
        }

        if (logMessage.context) {
            const keys = Object.keys(logMessage.context);
            if (keys.length > 0) {
                const logContext = document.createElement("row");
                logData.appendChild(logContext);

                for (let key of keys) {
                    let entry = this._buildLogObject(key, logMessage.context[key], true);
                    logContext.appendChild(entry);
                }
            }
        }

        return logData;
    }

    _buildLogObject(key, val, expanded) {
        let stringValue;
        const holder = document.createElement("column");
        holder.classList.add(this.id + "-logData-holder");
        
        const valueRow = document.createElement("row");
        valueRow.classList.add(this.id + "-logData-row");
        holder.appendChild(valueRow);

        const name = document.createElement("span");
        name.classList.add(this.id + "-logData-name");
        name.innerHTML = `${key}:`;
        valueRow.append(name);
        
         if (val !== null && val !== undefined && typeof val === 'object') {
            stringValue = stringify(val);

            const type = document.createElement("icon");
            type.classList.add(this.id + "-logData-type");
            type.classList.add("material-symbols-outlined");
            valueRow.appendChild(type);
            if (Array.isArray(val)) {
                type.innerHTML = "data_array";
                type.title = "List";
            } else {
                type.innerHTML = "data_object";
                type.title = "Map";
            }

            if (expanded) {
                const data = document.createElement("column");
                holder.appendChild(data);

                if (Array.isArray(val)) {
                    const arr = val.slice(0, Math.min(val.length, 10));
                    if (val.length > 10) {
                        arr.push("...");
                    }
                    for (let i = 0; i < arr.length; i++) {
                        let entryData = this._buildLogObject(i, arr[i]);
                        data.appendChild(entryData);
                    }
                } else {
                    const keys = Object.keys(val);
                    for (let key of keys) {
                        let entry = this._buildLogObject(key, val[key]);
                        data.appendChild(entry);
                    }
                }
            } else {
                const data = document.createElement("span");
                if (stringValue) {
                    data.innerHTML = stringValue.replaceAll("\n", "<br>").replaceAll(" ", "&nbsp;");
                }
                data.classList.add("hidden");
                holder.appendChild(data);

                valueRow.classList.add(this.id + "-hasData");
                valueRow.onclick = () => data.classList.toggle("hidden");
            }
        } else {
            stringValue = `${val}`;
            const dataVal = document.createElement("span");
            dataVal.classList.add(this.id + "-logData-value");
            dataVal.innerHTML = stringValue;
            valueRow.appendChild(dataVal);
        }

        const copy = document.createElement("icon");
        copy.title = "Copy to clipboard";
        copy.innerHTML = "content_copy";
        copy.classList.add(this.id + "-logData-copy");
        copy.classList.add("material-symbols-outlined");
        copy.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(stringValue);
            showToast("Copied to the clipboard");
        };
        valueRow.appendChild(copy);

        return holder;
    }

    _buildToolbar() {
        this._buildToolbarLevels();
        this._buildToolbarFilters();
        this._buildToolbarSearch();
        this._buildToolbarOrigins();
    }

    _buildToolbarLevels() {
        const buildButton = (level) => {
            const button = document.createElement("span");
            button.classList.add(this.id + "-toolbar-toggler");
            button.classList.add(this.id + "-toolbar-toggler-active");
            button.classList.add(this.id + "-toolbar-level-" + level);
            button.innerHTML = level;
            button.onclick = () => {
                button.classList.toggle(this.id + "-toolbar-toggler-active");
                this.logPanel.classList.toggle(this.id + "-hide-" + level);
            };
            return button;
        };

        const levels = ["info", "warn", "error"];
        const row = document.createElement("row");
        row.classList.add(this.id + "-toolbar-buttons");
        document.getElementById(this.id + "-toolbar").appendChild(row);
        for (let level of levels) {
            row.appendChild(buildButton(level));
        }
    }

    _buildToolbarFilters() {
        const row = document.createElement("row");
        row.classList.add(this.id + "-toolbar-filters");
        row.classList.add(this.id + "-toolbar-buttons");
        document.getElementById(this.id + "-toolbar").appendChild(row);
    }

    _buildToolbarSearch() {
        let timeoutId;
        this.searchInput = document.createElement("input");
        this.searchInput.setAttribute("type", "search");
        this.searchInput.setAttribute("placeholder", "Find logs");
        
        this.searchInput.oninput = () => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => this._filterLogs(this.searchInput.value), 500);
        };

        const icon = document.createElement("icon");
        icon.classList.add("material-symbols-outlined");
        icon.innerHTML = "search";

        const clearButton = document.createElement("icon");
        clearButton.classList.add("material-symbols-outlined");
        clearButton.classList.add(this.id + "-toolbar-button");
        clearButton.setAttribute("title", "Clear console");
        clearButton.innerHTML = "delete";
        clearButton.onclick = () => this.logPanel.innerHTML = "";

        const row = document.createElement("row");
        row.classList.add(this.id + "-toolbar-search");
        row.appendChild(icon);
        row.appendChild(this.searchInput);
        row.appendChild(clearButton);
        
        document.getElementById(this.id + "-toolbar").appendChild(row);
    }

    _buildToolbarOrigins() {
        const buildButton = (origin) => {
            const button = document.createElement("span");
            button.classList.add(this.id + "-toolbar-toggler");
            button.classList.add(this.id + "-toolbar-toggler-active");
            button.classList.add(this.id + "-toolbar-origin-" + origin);
            button.innerHTML = origin;
            button.onclick = () => {
                button.classList.toggle(this.id + "-toolbar-toggler-active");
                this.logPanel.classList.toggle(this.id + "-hide-" + origin);
            };
            return button;
        };

        const origins = ["editor", "client", "server"];
        const row = document.createElement("row");
        row.classList.add(this.id + "-toolbar-buttons");
        document.getElementById(this.id + "-toolbar").appendChild(row);
        for (let origin of origins) {
            row.appendChild(buildButton(origin));
        }
    }

    _filterLogs(text) {
        text = text.toLowerCase();

        const filterLog = (line, data) => {
            let spans = line.getElementsByTagName("span");
            for (let span of spans) {
                if (span.innerHTML.toLowerCase().indexOf(text) >= 0) {
                    line.classList.remove(this.id + "-hidden");
                    data.classList.remove(this.id + "-hidden");
                    return;
                }
            };
            spans = data.getElementsByTagName("span");
            for (let span of spans) {
                if (span.innerHTML.toLowerCase().indexOf(text) >= 0) {
                    line.classList.remove(this.id + "-hidden");
                    data.classList.remove(this.id + "-hidden");
                    return;
                }
            };

            line.classList.add(this.id + "-hidden");
            data.classList.add(this.id + "-hidden");
        };

        const lines = this.logPanel.getElementsByClassName(this.id + "-logLine");
        const linesData = this.logPanel.getElementsByClassName(this.id + "-logData");
        for (let i = 0; i < lines.length; i++) {
            filterLog(lines[i], linesData[i]);
        }
    }

    _getLogType(value) {
        switch (value.toLowerCase()) {
            case "warn":
            case "warning":
                return "warn";
            case "error":
            case "severe":
            case "shout":
                return "error";
            default:
                return "info";
        }
    }

    _scrollToEnd() {
        if (this.followTail) {
            this.logPanel.scrollTo(0, this.logPanel.scrollHeight);
        }
    }
}
class SearchPanel extends EditorPanel {
    constructor() {
        super();
        this.id = "search-panel";
        this.matchCase = false;
        this.matchWord = false;
        this.useRegex = false;
        this.searchTimeout;
    }

    populate() {
        document.getElementById("search-panel-results").innerHTML = "";
        if (!this.searchInput) {
            this.resultsPanel = document.getElementById(this.id + "-results");
            this._buildToolbar();
        }
    }

    onMouseEnter() { }

    selectNode(node) {
        const results = this.resultsPanel.getElementsByClassName(this.id + "-result-node-selected");
        for (let e of results) {
            e.classList.remove(this.id + "-result-node-selected");
        }
        document.getElementById(this.id + "-result-node" + node.getId())?.classList.add(this.id + "-result-node-selected");
    }

    _buildToolbar() {
        this.searchInput = document.createElement("input");
        this.searchInput.setAttribute("type", "search");
        this.searchInput.setAttribute("placeholder", "Search");
        this.searchInput.oninput = () => this.doSearch();

        const icon = document.createElement("icon");
        icon.classList.add("material-symbols-outlined");
        icon.innerHTML = "search";

        const caseButton = document.createElement("icon");
        caseButton.classList.add("material-symbols-outlined");
        caseButton.classList.add(this.id + "-toolbar-button");
        caseButton.setAttribute("title", "Match Case");
        caseButton.innerHTML = "match_case";
        caseButton.onclick = () => {
            this.matchCase = !this.matchCase;
            this.matchCase
                ? caseButton.classList.add(this.id + "-toolbar-button-on")
                : caseButton.classList.remove(this.id + "-toolbar-button-on");
            this.doSearch();
        };

        const wordButton = document.createElement("icon");
        wordButton.classList.add("material-symbols-outlined");
        wordButton.classList.add(this.id + "-toolbar-button");
        wordButton.setAttribute("title", "Match Whole Word");
        wordButton.innerHTML = "match_word";
        wordButton.onclick = () => {
            this.matchWord = !this.matchWord;
            this.matchWord
                ? wordButton.classList.add(this.id + "-toolbar-button-on")
                : wordButton.classList.remove(this.id + "-toolbar-button-on");
            this.doSearch();
        };

        const regexButton = document.createElement("icon");
        regexButton.classList.add("material-symbols-outlined");
        regexButton.classList.add(this.id + "-toolbar-button");
        regexButton.setAttribute("title", "Use Regular Expression");
        regexButton.innerHTML = "regular_expression";
        regexButton.onclick = () => {
            this.useRegex = !this.useRegex;
            this.useRegex
                ? regexButton.classList.add(this.id + "-toolbar-button-on")
                : regexButton.classList.remove(this.id + "-toolbar-button-on");
            this.doSearch();
        };

        const clearButton = document.createElement("icon");
        clearButton.classList.add("material-symbols-outlined");
        clearButton.classList.add(this.id + "-toolbar-button");
        clearButton.setAttribute("title", "Clear");
        clearButton.innerHTML = "delete";
        clearButton.onclick = () => {
            this.searchInput.value = "";
            this.resultsPanel.innerHTML = "";
        };

        const row = document.createElement("row");
        row.classList.add(this.id + "-toolbar-search");
        row.appendChild(icon);
        row.appendChild(this.searchInput);
        row.appendChild(caseButton);
        row.appendChild(wordButton);
        row.appendChild(regexButton);
        row.appendChild(clearButton);
        document.getElementById(this.id + "-toolbar").appendChild(row);
    }

    doSearch(text) {
        window.clearTimeout(this.searchTimeout);
        document.getElementById(this.id + "-tab").click();
        window.setTimeout(() => this.searchInput.focus());
        if (text) {
            this.searchInput.value = text;
        }
        if (this.searchInput.value) {
            if (this.resultsPanel.getElementsByClassName("loader").length === 0) {
                this.resultsPanel.innerHTML = "";
                const spinner = document.createElement("div");
                spinner.className = "loader";
                this.resultsPanel.appendChild(spinner);
            }

            this.searchTimeout = window.setTimeout(() => {
                const results = Editor.project.findReferences(this.searchInput.value, this.matchCase, this.matchWord, this.useRegex);
                this.renderResults(results);
            }, 500);
        }
    }

    renderResults(results) {
        this.resultsPanel.innerHTML = "";
        for (let reference of results) {
            let rootNode = reference.node;
            let references = reference.references;
            this.handleNodeReferences(rootNode, references, rootNode);
        }
    }

    handleNodeReferences(node, references, rootNode) {
        if (!references) {
            return;
        }
        if (Array.isArray(references)) {
            for (let entry of references) {
                this.handleReference(node, entry, rootNode);
            }
        } else if (typeof references === "object") {
            this.handleReference(node, references, rootNode);
        }
    }

    handleReference(node, ref, rootNode) {
        if (!ref) {
            return;
        }
        if (ref instanceof NodeReference) {
            this.handleNodeReferences(ref.node, ref.references, rootNode);
        } else if (Array.isArray(ref)) {
            for (let entry of ref) {
                this.handleReference(node, entry, rootNode);
            }
        } else if (typeof ref === "object") {
            for (let key in ref) {
                let val = ref[key];
                if (val === null || val === undefined) {
                    continue;
                }

                if (val instanceof NodeReference) {
                    this.handleNodeReferences(val.node, val.references, rootNode);
                } else if (typeof val === "object") {
                    this.handleReference(node, val, rootNode);
                } else {
                    this.renderReference(node, key, val, rootNode);
                }
            }
        }
    }

    renderReference(node, key, value, rootNode) {
        const keyInfo = document.createElement("span");
        keyInfo.innerText = key;
        const valueInfo = document.createElement("span");
        valueInfo.innerText = value;
        const propertyInfo = document.createElement("row");
        propertyInfo.classList.add(this.id + "-result-property");
        propertyInfo.appendChild(keyInfo);
        propertyInfo.appendChild(valueInfo);

        let propertyHolder = document.getElementById(`${node.getId()}-references`);
        if (propertyHolder) {
            propertyHolder.appendChild(propertyInfo);
            return;
        }

        const row = document.createElement("row");
        row.classList.add(this.id + "-result");

        const nodeInfo = this.buildNodeInfo(node, rootNode);
        row.appendChild(nodeInfo);

        propertyHolder = document.createElement("column");
        propertyHolder.setAttribute("id", `${node.getId()}-references`);
        propertyHolder.classList.add(this.id + "-result-properties");
        propertyHolder.appendChild(propertyInfo);
        row.appendChild(propertyHolder);

        if (node !== rootNode) {
            const rootNodeInfo = this.buildRootNodeInfo(rootNode);
            row.appendChild(rootNodeInfo);
        }
        this.resultsPanel.appendChild(row);
    }

    buildNodeInfo(node, rootNode) {
        const nodeName = document.createElement("span");
        nodeName.classList.add(this.id + "-result-node-name");
        nodeName.innerText = node.getName();
        const nodeType = document.createElement("span");
        nodeType.innerText = node.getFriendlyType().replace("KAction", "").replace("KListAction", "");
        const nodeId = document.createElement("span");
        nodeId.innerText = node.getId();
        const rootTypeInfo = document.createElement("span");
        rootTypeInfo.innerText = node.rootType;

        const row = document.createElement("row");
        row.appendChild(nodeType);
        row.appendChild(rootTypeInfo);

        const nodeInfo = document.createElement("column");
        nodeInfo.classList.add(this.id + "-result-node-info");
        nodeInfo.appendChild(nodeName);
        nodeInfo.appendChild(row);
        nodeInfo.appendChild(nodeId);
        
        const icon = document.createElement("icon");
        icon.classList.add("material-symbols-outlined");
        icon.innerText = this.getIconForNode(node);

        const navigateIcon = document.createElement("icon");
        navigateIcon.classList.add("material-symbols-outlined");
        navigateIcon.innerText = "navigate_next";

        const line = document.createElement("row");
        line.setAttribute("id", this.id + "-result-node" + node.getId());
        line.classList.add(this.id + "-result-node");
        line.appendChild(icon);
        line.appendChild(nodeInfo);
        line.appendChild(navigateIcon);
        line.onclick = () => {
            if (rootNode !== node) {
                Editor.selectNode(rootNode);
            }
            Editor.selectNode(node);
        };
        return line;
    }

    buildRootNodeInfo(node) {
        const nodeName = document.createElement("span");
        nodeName.innerText = node.getName();
        const nodeType = document.createElement("span");
        nodeType.innerText = node.getFriendlyType();
        const nodeId = document.createElement("span");
        nodeId.innerText = node.getId();

        const row = document.createElement("row");
        row.appendChild(nodeName);
        row.appendChild(nodeType);

        const nodeInfo = document.createElement("column");
        nodeInfo.classList.add(this.id + "-result-node-info");
        nodeInfo.appendChild(row);
        nodeInfo.appendChild(nodeId);

        const icon = document.createElement("icon");
        icon.classList.add("material-symbols-outlined");
        icon.innerText = this.getIconForNode(node);

        const navigateIcon = document.createElement("icon");
        navigateIcon.classList.add("material-symbols-outlined");
        navigateIcon.innerText = "navigate_next";

        const line = document.createElement("row");
        line.setAttribute("id", this.id + "-result-node" + node.getId());
        line.classList.add(this.id + "-result-node");
        line.appendChild(icon);
        line.appendChild(nodeInfo);
        line.appendChild(navigateIcon);
        line.onclick = () => {
            Editor.selectNode(node);
        };
        return line;
    }

    getIconForNode(node) {
        let type;
        if (node instanceof WidgetDerivative || node instanceof TypeNode) {
            type = node.getFriendlyType().toLowerCase();
        } else if (node.rootType.toLowerCase() === "widget") {
            return getIconForWidget(node.getType());
        } else {
            type = node.rootType.toLowerCase();
        }

        switch (type) {
            case "screen":
                return "phone_iphone";
            case "action":
                return "account_tree";
            case "template":
                return "style";
            case "component":
                return "layers";
            case "model":
                return "assignment";
            case "request":
                return "cloud";
            case "folder":
                return "folder_open";
            default:
                return "question_mark";
        }
    }
}


class FooterPanel extends EditorPanel {
    static id = "footer-panel";

    constructor() {
        super();
        this.consolePanel = new ConsolePanel();
        this.searchPanel = new SearchPanel();
        this.panels = [this.consolePanel, this.searchPanel];
    }

    populate() {
        this.panels.forEach(p => p.populate());
        document.getElementById(FooterPanel.id).onmouseenter = () => this.panels.forEach(p => p.onMouseEnter());
    }
    selectNode(node) { this.panels.forEach(p => p.selectNode(node)); }
  onNodeCreated(origin, node, screen) { this.panels.forEach(p => p.onNodeCreated(origin, node, screen)); }
  onNodeUpdated(origin, node, screen) { this.panels.forEach(p => p.onNodeUpdated(origin, node, screen)); }
  onNodeDeleted(origin, node, screen) { this.panels.forEach(p => p.onNodeDeleted(origin, node, screen)); }

    static show() {
        document.getElementById(this.id).classList.add(this.id + "-expanded");
        document.getElementById(this.id).classList.remove(this.id + "-collapsed");
    }

    static hide() {
        document.getElementById(this.id).classList.remove(this.id + "-expanded");
        document.getElementById(this.id).classList.add(this.id + "-collapsed");
    }
}
class WidgetPanel extends EditorPanel {
  constructor() {
    super();
    this.id = "widget-panel";
    this.cssId = "widget-panel";
        this.schema = null;
  }

    populate() {
    const rootPanel = document.getElementById(this.id);
    rootPanel.innerHTML = "";

        this.schema = Editor.project.getSchema(Editor.project.getTopSolution().id);
    const widgetTypes = this.schema.getWidgetsOfType(null);

        const categoryMap = {
            "common": [],
            "layout": [],
            "text": [],
            "input": [],
            "action": [],
            "data list": [],
            "asset": [],
            "decoration": [],
            "button": [],
            "structure & navigation": [],
            "scrolling": [],
            "animation": [],
        };
        for (let type of widgetTypes) {
            let spec = this.schema.widgets[type]
            let widgetCategories = spec.tags ?? ["misc"];
            widgetCategories.sort();
            for (let category of widgetCategories) {
                if (!categoryMap[category]) {
                    categoryMap[category] = [];
                }
                categoryMap[category].push({
                    name: type,
                    ...spec
                });
            }
        }

        const categories = Object.keys(categoryMap);
        // categories.sort();
        for (let category of categories) {
            if (categoryMap[category] && categoryMap[category].length > 0) {
                let element = this.buildCategory(category, categoryMap[category]);
                rootPanel.appendChild(element);
            }
        }
  }

    buildCategory(category, widgetList) {
        const holder = document.createElement("column");
        holder.classList.add(`${this.cssId}-category`);

        const header = document.createElement("row");
        header.classList.add(`${this.cssId}-category-header`);
        header.onclick = () => {
            holder.classList.toggle(`${this.cssId}-category-collapsed`);
        }
        const title = document.createElement("span");
        title.innerHTML = category;
        header.appendChild(title);

        const itemsHolder = document.createElement("grid");
        itemsHolder.classList.add(`${this.cssId}-category-items`);

        for (let widget of widgetList) {
            let element = this.buildWidget(widget);
            itemsHolder.appendChild(element);
        }

        holder.append(header);
        holder.append(itemsHolder);

        return holder;
    }

    buildWidget(widget) {
        const types = this.schema.getWidgetInheritance(widget.name);

        const icon = document.createElement("icon");
        icon.classList.add("material-symbols-outlined");
        icon.innerHTML = getIconForWidget(widget.name);
        const name = document.createElement("span");
        name.innerHTML = widget.name;

        const element = document.createElement("column");
        element.classList.add(`${this.cssId}-category-item`);
        element.title = widget.name;
        element.appendChild(icon);
        element.appendChild(name);
        element.setAttribute("draggable", true);
        element.ondragstart = (ev) => {
            ev.dataTransfer.clearData();
            ev.dataTransfer.setData("text/plain", widget.name);
            for (let type of types) {
                document.body.classList.add(`widget-drag-${type}`);
            }
        };
        element.ondragend = () => {
            for (let type of types) {
                document.body.classList.remove(`widget-drag-${type}`);
            }
        };
        return element;
    }
}
class Schema {
  constructor(solutionId, schemaData) {
    this.solutionId = solutionId;
    this.widgets = schemaData.widgets;
    this.actions = schemaData.actions;
    this.properties = schemaData.properties;
    this.widgetTypes = {};

    for (let widget in this.widgets) {
      let types = this.getWidgetInheritance(widget);
      for (let type of types) {
        if (!this.widgetTypes[type]) {
          this.widgetTypes[type] = [];
        }
        this.widgetTypes[type].push({
          "type": widget,
          "spec": this.widgets[widget]
        });
      }
    }
  }

  _getTypeSchema(rootType) {
    switch (rootType.toLowerCase()) {
      case "widget":
      case "widgets":
        return this.widgets;
      case "action":
      case "actions":
      case "kaction":
      case "klistaction":
        return this.actions;
      default:
        const props = {...this.properties};
        for (let type of Editor.project.getTypes(this.solutionId)) {
          props[type.getType()] = type;
        }
        return props;
    }
  }

  getSchema(node) {
    if (!node || !(node instanceof Node) || node instanceof Folder)
      return null;

    return this._getTypeSchema(node.rootType)[node.getType()];
  }

  getWidgets(node) {
    if (!node || !(node instanceof Node) || node instanceof Folder)
      return null;
    
    const typeName = node.getType();
    const schema = this._getTypeSchema(node.rootType);
    const type = schema[typeName];
    if (!type)
      return null;
    if (Array.isArray(type))
      return type;

    const typeWidgets = type.widgets || {};
    const widgets = {};
    for (const key in typeWidgets) {
      widgets[key] = typeWidgets[key];
    }

    let baseTypeName = type["extends"];
    while (baseTypeName) {
      const baseType = schema[baseTypeName];
      if (!baseType) {
        break;
      }

      let baseWidgets = baseType.widgets || {};
      for (const key in baseWidgets) {
        widgets[key] = baseWidgets[key];
      }
      baseTypeName = baseType["extends"];
    }
    return widgets;
  }

  getActions(node) {
    if (!node || !(node instanceof Node) || node instanceof Folder)
      return null;
    
    const typeName = node.getType();
    const schema = this._getTypeSchema(node.rootType);
    const type = schema[typeName];
    if (!type)
      return null;
    if (Array.isArray(type))
      return type;

    const typeActions = type.actions || {};
    const actions = {};
    for (const key in typeActions) {
      actions[key] = typeActions[key];
    }

    let baseTypeName = type["extends"];
    while (baseTypeName) {
      const baseType = schema[baseTypeName];
      if (!baseType) {
        break;
      }

      let baseActions = baseType.actions || {};
      for (const key in baseActions) {
        actions[key] = baseActions[key];
      }
      baseTypeName = baseType["extends"];
    }
    return actions;
  }

  getProperties(node) {
    if (!node || !(node instanceof Node) || node instanceof Folder)
      return null;

    const schema = this._getTypeSchema(node.rootType);
    return this._getPropertyProperties(schema, node.getType());
  }

  getPropertyProperties(typeName) {
    const schema = this._getTypeSchema("properties");
    return this._getPropertyProperties(schema, typeName);
  }

  _getPropertyProperties(schema, typeName) {
    const type = schema[typeName];
    if (!type)
      return null;
    if (Array.isArray(type))
      return type;

    const typeProperties = type.properties || {};
    const properties = {};
    for (const key in typeProperties) {
      properties[key] = typeProperties[key];
    }

    let baseTypeName = type["extends"];
    while (baseTypeName) {
      const baseType = schema[baseTypeName];
      if (!baseType) {
        break;
      }

      let baseProperties = baseType.properties || {};
      for (const key in baseProperties) {
        properties[key] = baseProperties[key];
      }
      baseTypeName = baseType["extends"];
    }
    return properties;
  }

  getTypes(rootType, typeName) {
    if (!rootType) {
      return [];
    }
    if (!typeName) {
      typeName = "";
    }

    const schema = this._getTypeSchema(rootType);
    const results = [];
    typeName = typeName.replace("[", "").replace("]", "");
    const returnAll = typeName.length === 0;

    for (let key in schema) {
      let type = schema[key];
      if (type.abstract) {
        continue;
      }
      if (returnAll || key === typeName) {
        results.push(key);
      } else {
        let subType = type.extends;
        while (subType) {
          if (subType == typeName) {
            results.push(key);
            break;
          }
          subType = schema[subType]?.extends;
        }
      }
    }
    return results;
  }

  getWidgetTypes(typeName) {
    return this.getTypes("widget", typeName);
  }

  getActionTypes(typeName) {
    return this.getTypes("action", typeName);
  }

  getPropertyTypes(typeName) {
    return this.getTypes("property", typeName);
  }
  
  getWidgetInheritance(typeName) {
    const types = [];
    const type = this.widgets[typeName];
    if (type) {
      types.push(typeName);
      let base = type["extends"];
      while (base) {
        types.push(base);
        let baseType = this.widgets[base];
        if (baseType) {
          base = baseType["extends"];
        } else {
          base = null;
        }
      }
    }
    return types;
  }

  getWidgetsOfType(typeName) {
    typeName = typeName || "Widget";
    const results = [];
    typeName = typeName.replace("[", "").replace("]", "");

    if (this.widgetTypes.hasOwnProperty(typeName)) {
      for (let type of this.widgetTypes[typeName]) {
        if (type.spec["abstract"]) {
          continue;
        }
        results.push(type.type);
      }
    }
    return results;
  }

  getWidgetsWithProperties(widgetType, targetProperties, propertyType) {
    const results = [];
    const widgets = this.widgetTypes[widgetType];
    const widgetTypes = [propertyType, "[" + propertyType + "]"];

    for (let widget of widgets) {
      if (widget.spec["abstract"]) {
        continue;
      }

      let objectsToSearch = [
        widget.spec.properties,
        widget.spec.actions,
        widget.spec.widgets
      ];

      for (let obj of objectsToSearch) {
        if (obj) {
          for (let targetProperty of targetProperties) {
            if (obj.hasOwnProperty(targetProperty) && widgetTypes.indexOf(obj[targetProperty]) >= 0) {
              results.push(widget.type);
              break;
            }
          }
        }
      }
    }
    return results;
  }

  isWidget(typeName) {
    if (typeof typeName != "string" || typeName === "Screen") {
      return false;
    }

    typeName = typeName.replace("[", "").replace("]", "");
    return this.widgetTypes.hasOwnProperty(typeName);
  }
  
  isAction(typeName) {
    if (typeof typeName != "string") {
      return false;
    }

    typeName = typeName.replace("[", "").replace("]", "");
    return this.actions.hasOwnProperty(typeName);
  }
}

class Project {
  build(solutions) {
    // A Solution can have Schema but no Model (eg: Lowder)
    this.solutions = [];
    this._solutions = {};

    this._mergeSchemas(solutions);

    for (let solutionData of solutions) {
      if (solutionData.name === "Lowder") {
        continue;
      }
      
      let solution;
      if (solutionData.filePath) {
        solution = new Solution();
        solutionData.data.id ??= getUUID();
      }
      
      let solutionId = solutionData.data?.id ?? solutionData.name;
      let schema = new Schema(solutionId, solutionData);

      this._solutions[solutionId] = {
        id: solutionId,
        name: solutionData.name,
        filePath: solutionData.filePath,
        absolutePath: solutionData.absolutePath,
        schema: schema,
        schemaStats: solutionData.schemaStats,
        solution: solution,
      };

      if (solution) {
        this.solutions.unshift(solution);
        solution.build(solutionData.name, solutionData.filePath, solutionData.data ?? {});
      }
    }
  }

  updateSchema(schemaData) {
    this._mergeSchemas(schemaData);
    const solutionList = [];
    for (let key in this._solutions) {
      solutionList.push(this._solutions[key]);
    }

    for (let schema of schemaData) {
      let solution = solutionList.find(s => s.name === schema.name && s.filePath === schema.filePath);
      if (solution) {
        solution.schema = new Schema(solution.id, schema);
        solution.schemaStats = schema.schemaStats;
      }
    }
  }

  _mergeSchemas(schemas) {
    // All Solutions have access to Lowder Schema, but only the Top Solution has access to all Schemas.
    // Intermediate Solutions will have access to it's own Schema and Lowder's
    const lowder = schemas.find(s => s.name === "Lowder");
    const baseWidgets = lowder?.widgets ?? {};
    const baseActions = lowder?.actions ?? {};
    const baseProperties = lowder?.properties ?? {};

    const cumulativeWidgets = {};
    const cumulativeActions = {};
    const cumulativeProperties = {};

    for (let i = 0; i < schemas.length; i++) {
      let schema = schemas[i];
      if (schema.name === "Lowder") {
        continue;
      }

      schema.schemaStats = {
        widgets: Object.keys(schema.widgets).length,
        actions: Object.keys(schema.actions).length,
        properties: Object.keys(schema.properties).length,
      };

      mergeMaps(schema.widgets, baseWidgets);
      mergeMaps(schema.actions, baseActions);
      mergeMaps(schema.properties, baseProperties);

      if (i === schemas.length - 1) {
        mergeMaps(schema.widgets, cumulativeWidgets);
        mergeMaps(schema.actions, cumulativeActions);
        mergeMaps(schema.properties, cumulativeProperties);
      } else {
        mergeMaps(cumulativeWidgets, schema.widgets);
        mergeMaps(cumulativeActions, schema.actions);
        mergeMaps(cumulativeProperties, schema.properties);
      }
    }
  }

  getSchema(solutionId) {
    return this._solutions[solutionId]?.schema;
  }

  getSchemaStats(solutionId) {
    return this._solutions[solutionId]?.schemaStats;
  }

  _getSolutionsForId(solutionId) {
    if (solutionId === this.getTopSolution().id) {
      return this.solutions;
    }
    return [this.getSolution(solutionId)];
  }

  getSolution(id) {
    for (let solution of this.solutions) {
      if (solution.getId() === id)
        return solution;
    }
    return null;
  }

  getTopSolution() {
    return this.solutions[0];
  }

  getFolders(solutionId) {
    return this.getSolution(solutionId)?.folders ?? [];
  }

  getScreen(id) {
    for (let solution of this.solutions) {
      let obj = solution.getScreen(id);
      if (obj) {
        return obj;
      }
    }
    return null;
  }

  findWidget(id) {
    for (let solution of this.solutions) {
      let obj = solution.findWidget(id);
      if (obj) {
        return obj;
      }
    }
    return null;
  }

  getScreens(solutionId) {
    let results = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.screens;
      if (obj)
        results = results.concat(obj);
    }
    return results;
  }

  getTemplate(id) {
    for (let solution of this.solutions) {
      let obj = solution.getTemplate(id);
      if (obj) {
        return obj;
      }
    }
    return null;
  }

  findTemplates(solutionId, widgetType) {
    let types = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.findTemplates(widgetType);
      if (obj)
        types = types.concat(obj);
    }
    return types;
  }

  getTemplates(solutionId) {
    let results = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.templates;
      if (obj)
        results = results.concat(obj);
    }
    return results;
  }

  getComponent(id) {
    for (let solution of this.solutions) {
      let obj = solution.getComponent(id);
      if (obj) {
        return obj;
      }
    }
    return null;
  }

  findComponents(solutionId, widgetType) {
    let types = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.findComponents(widgetType);
      if (obj)
        types = types.concat(obj);
    }
    return types;
  }

  getComponents(solutionId) {
    let results = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.components;
      if (obj)
        results = results.concat(obj);
    }
    return results;
  }

  getModel(type) {
    for (let solution of this.solutions) {
      let obj = solution.getModel(type);
      if (obj)
        return obj;
    }
    return null;
  }

  getModels(solutionId) {
    let types = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.getModels();
      if (obj)
        types = types.concat(obj);
    }
    return types;
  }

  getRequest(type) {
    for (let solution of this.solutions) {
      let obj = solution.getRequest(type);
      if (obj)
        return obj;
    }
    return null;
  }

  getRequests(solutionId) {
    let results = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.getRequests();
      if (obj)
        results = results.concat(obj);
    }
    return results;
  }

  getTypes(solutionId) {
    let results = [];
    for (let solution of this._getSolutionsForId(solutionId)) {
      let obj = solution.types;
      if (obj)
        results = results.concat(obj);
    }
    return results;
  }

  getTestData(nodeId) {
    return window.localStorage.getItem(`${nodeId}_mock`);
  }

  setTestData(nodeId, data) {
    window.localStorage.setItem(`${nodeId}_mock`, data);
  }

  changeSolution(type, node, solutionId) {
    this.getSolution(node.getSolutionId()).removeRootNode(type, node);
    this.getSolution(solutionId).appendRootNode(type, node);
  }

  findReferences(text, matchCase, matchWord, isExpression) {
    // /(?<!\w)word(?!\w)/gi
    let options = "g";
    if (!matchCase) {
      options += "i";
    }

    let expression;
    if (isExpression) {
      expression = new RegExp(text, options);
    } else {
      if (matchWord) {
        expression = new RegExp(`(?<!\w)${text}(?!\w)`, options);
      } else {
        expression = new RegExp(`${text}`, options);
      }
    }
    const references = [];
    for (let solution of this.solutions) {
      references.push(...solution.findReferences(expression));
    }
    return references;
  }
}

class Solution {
  constructor() {
  }

  build(name, filePath, solutionData) {
    this.id = solutionData["id"] ?? getUUID();
    this.name = name ?? solutionData["name"];
    this.filePath = filePath;
    this.type = solutionData["type"] ?? "flutter";
    this.landingScreen = solutionData["landingScreen"];
    this.screens = [];
    this.templates = [];
    this.components = [];
    this.types = [];
    this.folders = [];
    this.environmentData = new EnvironmentVariables(solutionData["environmentData"]);
    this.stringResources = new StringResources(solutionData["stringResources"]);

    if (solutionData["folders"]) {
      for (let folderData of solutionData["folders"]) {
        const folder = new Folder(this.id, folderData);
        this.folders.push(folder);
      }
    }
    if (solutionData["types"]) {
      for (let typeData of solutionData["types"]) {
        const type = new TypeNode(this.id, typeData);
        this.types.push(type);
      }
    }
    if (solutionData["templates"]) {
      for (let templateData of solutionData["templates"]) {
        const template = new Template(this.id, templateData);
        this.templates.push(template);
      }
    }
    if (solutionData["components"]) {
      for (let componentData of solutionData["components"]) {
        const component = new Component(this.id, componentData);
        this.components.push(component);
      }
    }
    if (solutionData["screens"]) {
      for (let screenData of solutionData["screens"]) {
        const screen = new Screen(this.id, screenData);
        this.screens.push(screen);
      }
    }
  }

  getId() {
    return this.id;
  }

  getScreen(screenId) {
    return this.screens.find(s => s.getId() === screenId)
      ?? this.screens.find(s => s.getProperty("routeName") === screenId)
      ?? null;
  }

  findWidget(widgetId) {
    let widget;
    for (let screen of this.screens) {
      widget = screen.findWidget(widgetId);
      if (widget)
        return widget;
    }
    return null;
  }

  getTemplate(id) {
    if (id) {
      return this.templates.find(e => e.getId() === id);
    }
    return null;
  }

  findTemplates(widgetType) {
    if (widgetType) {
      return this.templates.filter(e => e.getType() === widgetType);
    }
    return null;
  }

  getComponent(id) {
    if (id) {
      return this.components.find(e => e.getId() === id);
    }
    return null;
  }

  findComponents(widgetType) {
    if (widgetType) {
      return this.components.filter(e => e.getType() === widgetType);
    }
    return null;
  }

  getModels() {
    return this.types.filter(e => e.extends === "KModel");
  }

  getModel(type) {
    if (type) {
      return this.getModels().find(e => e.getType() === type);
    }
    return null;
  }

  getRequests() {
    return this.types.filter(e => e.extends === "KRequest");
  }

  getRequest(type) {
    if (type) {
      return this.getRequests().find(e => e.getType() === type);
    }
    return null;
  }

  createScreen() {
    const newScreen = new Screen(this.id, { _id: getUUID() });
    this.screens.push(newScreen);
    Editor.logInfo(`[Solution] New Screen '${newScreen.getName() || newScreen.getId()}' created on '${this.name}'.`, null, null, newScreen);
    return newScreen;
  }

  createTemplate(widgetType) {
    const newTemplate = Template.create(this.id, widgetType);
    this.templates.push(newTemplate);
    Editor.logInfo(`[Solution] New '${widgetType}' Template '${newTemplate.getName() || newTemplate.getId()}' created on '${this.name}'.`, null, null, newTemplate);
    return newTemplate;
  }

  createComponent(widgetType) {
    const newComponent = Component.create(this.id, widgetType);
    this.components.push(newComponent);
    Editor.logInfo(`[Solution] New '${widgetType}' Component '${newComponent.getName() || newComponent.getId()}' created on '${this.name}'.`, null, null, newComponent);
    return newComponent;
  }

  createType(baseType) {
    const id = getUUID();
    const args = {
      _id: id,
      _type: id,
      extends: baseType,
    };
    const newType = baseType === "request" ? new RequestNode(this.id, args) : new TypeNode(this.id, args);
    this.types.push(newType);
    Editor.logInfo(`[Solution] New '${baseType}' '${newType.getName() || newType.getId()}' created on '${this.name}'.`, null, null, newType);
    return newType;
  }

  createFolder() {
    const newFolder = new Folder(this.id, { _id: getUUID() });
    this.folders.push(newFolder);
    return newFolder;
  }

  removeRootNode(type, node) {
    const array = this._getTypeArray(type);
    if (array) {
      const idx = array.indexOf(node);
      if (idx >= 0) {
        array.splice(idx, 1);
        Editor.logInfo(`[Solution] '${type}' '${node.getName() || node.getId()}' removed from '${this.name}'.`, null, null, node);
      }
    }
  }

  cloneRootNode(type, node) {
    const array = this._getTypeArray(type);
    if (array) {
      const newNode = node.clone();
      array.push(newNode);
      Editor.logInfo(`[Solution] '${type}' '${newNode.getId()}' cloned from '${node.getName() || node.getId()}' on '${this.name}'.`, null, null, newNode);
      return newNode;
    }
    return null;
  }

  appendRootNode(type, node) {
    const array = this._getTypeArray(type);
    if (array) {
      node._solution = this.getId();
      array.push(node);
    }
  }

  canMoveUp(type, node) {
    const array = this._getTypeArray(type);
    if (array) {
      const folder = node.getFolder();
      const folderArray = array.filter((entry) => entry.getFolder() === folder);
      return folderArray.indexOf(node) > 0;
    }
    return false;
  }

  canMoveDown(type, node) {
    const array = this._getTypeArray(type);
    if (array) {
      const folder = node.getFolder();
      const folderArray = array.filter((entry) => entry.getFolder() === folder);
      return folderArray.indexOf(node) < folderArray.length - 1;
    }
    return false;
  }

  moveRootNode(type, node, direction) {
    const array = this._getTypeArray(type);
    if (array) {
      const idx = array.indexOf(node);
      if (idx >= 0) {
        const folder = node.getFolder();
        const folderArray = array.filter((entry) => entry.getFolder() === folder);
        const folderIdx = folderArray.indexOf(node);

        if (direction == "up" && this.canMoveUp(type, node)) {
          const prevIdx = array.indexOf(folderArray[folderIdx - 1]);
          array.splice(idx, 1);
          array.splice(prevIdx, 0, node);
        } else if (direction == "down" && this.canMoveDown(type, node)) {
          const nextIdx = array.indexOf(folderArray[folderIdx + 1]);
          array.splice(idx, 1);
          array.splice(nextIdx, 0, node);
        }
      }
    }
  }

  findReferences(expression) {
    const references = [];
    const rootNodes = [
      ...this.screens,
      ...this.templates,
      ...this.components,
      ...this.types,
    ];
    for (let entry of rootNodes) {
      let refs = entry.findReferences(expression);
      if (refs) {
        references.push(refs);
      }
    }
    return references;
  }

  _getTypeArray(type) {
    switch (type) {
      case "screen":
        return this.screens;
      case "template":
        return this.templates;
      case "component":
        return this.components;
      case "type":
      case "model":
      case "request":
        return this.types;
      case "folder":
        return this.folders;
      default:
        return null;
    }
  }
}




function EnvironmentVariables(data) {
  this.environments = data?.environments ?? ["Dev", "QA", "Prod"];
  this.keys = data?.keys ?? [];
  this.values = data?.values ?? [];
}

function StringResources(data) {
  this.languages = data?.languages ?? ["en", "pt"];
  this.keys = data?.keys ?? [];
  this.values = data?.values ?? [];
}

class Node {
  constructor(solution, nodeData) {
    this._solution = solution;
    this._id = getUUID();
    this._type = null;
    this.name = null;
    this.properties = {};
    this.actions = {};
    this.fromObject(nodeData);
  }

  fromObject(nodeData) {
    if (nodeData) {
      this._id = nodeData["_id"] ?? this.getId();
      this._type = nodeData["_type"] ?? this.getType();
      this.name = nodeData["name"] ?? this.getName();
    }
  }

  getSolutionId() {
    return this._solution;
  }

  getId() {
    return this._id;
  }

  getType() {
    return this._type;
  }

  getFriendlyType() {
    return this.getType();
  }

  get rootType() {
    return null;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getSchema() {
    return Editor.project.getSchema(this.getSolutionId()).getSchema(this);
  }

  getActions() {
    return this.actions;
  }

  getActionSchema() {
    return Editor.project.getSchema(this.getSolutionId()).getActions(this);
  }

  getAction(key) {
    return this.actions[key];
  }

  setAction(key, action) {
    this.actions[key] = action;
  }

  removeAction(key) {
    delete this.actions[key];
  }

  getProperties() {
    return this.properties;
  }

  getPropertySchema() {
    return Editor.project.getSchema(this.getSolutionId()).getProperties(this);
  }

  getProperty(key) {
    return this.properties[key];
  }

  setProperty(key, value) {
    this.properties[key] = value;
  }

  removeProperty(key) {
    delete this.properties[key];
  }

  findReferences(text) {
    return this._findNodeReferences(text, this);
  }

  _findNodeReferences(expression, node) {
    const references = { }
    for (let key in node) {
      let refs = this._findValueReferences(expression, node[key]);
      if (refs) {
        references[key] = refs;
      }
    }
    if (Object.keys(references).length > 0) {
      return new NodeReference(this, references);
    }
    return null;
  }

  _findValueReferences(expression, val) {
    if (!val) {
      return null;
    }

    let refs, res;
    if (val instanceof Node) {
      return val._findNodeReferences(expression, val);
    } else if (Array.isArray(val)) {
      refs = [];
      for (let entry of val) {
        res = this._findValueReferences(expression, entry);
        if (res) {
          refs.push(res);
        }
      }
      return refs.length > 0 ? refs : null;
    } else if (typeof val === 'object') {
      refs = {};
      for (let key in val) {
        res = this._findValueReferences(expression, val[key]);
        if (res) {
          refs[key] = res;
        }
      }
      return Object.keys(refs).length > 0 ? refs : null;
    } else {
      if (expression.test(`${val}`)) {
        return val;
      }
      return null;
    }
  }
}


class RootNode extends Node {
  constructor(solution, nodeData) {
    super(solution, nodeData);
    this.isRootNode = true;
  }

  fromObject(data) {
    super.fromObject(data);
    if (data) {
      this._folder = data["_folder"];
    }
  }

  getFolder() {
    return this._folder ?? null;
  }

  setFolder(value) {
    this._folder = value;
  }
}


class Folder extends RootNode {
  constructor(solution, nodeData) {
    super(solution, nodeData);
    this._type = this._type ?? "Folder";
  }

  setFolder(value) {
    if (value !== this.getId()) {
      super.setFolder(value);
    }
  }
}


class TypeNode extends RootNode {
  constructor(solution, nodeData) {
    super(solution, nodeData);
  }

  fromObject(data) {
    super.fromObject(data);
    if (data) {
      this.extends = data["extends"];
      const props = data["properties"] || {};
      for (let key in props) {
        this.setProperty(key, props[key]);
      }
    }
  }

  getName() {
    return super.getName() ?? this.getId();
  }

  getType() {
    return this.getId();
  }

  getFriendlyType() {
    return this.extends === "KRequest" ? "Request" : "Model";
  }

  get rootType() {
    return "Type";
  }

  clone() {
    const newObj = JSON.parse(stringify(this));
    delete newObj["_id"];
    delete newObj["_type"];
    return new TypeNode(this.getSolutionId(), newObj);
  }
}

class RequestNode extends TypeNode {
  constructor(solution, nodeData) {
    super(solution, nodeData);
  }

  clone() {
    const newObj = JSON.parse(stringify(this));
    delete newObj["_id"];
    delete newObj["_type"];
    return new RequestNode(this.getSolutionId(), newObj);
  }
}


class Action extends Node {
  constructor(solution, nodeData) {
    super(solution, nodeData);
  }

  get rootType() {
    return "Action";
  }

  fromObject(objData) {
    super.fromObject(objData);
    const solutionId = this.getSolutionId();
    const props = objData["properties"] || {};
    const actions = objData["actions"] || {};

    // Sanitize properties: only add existing properties in the schema
    const propSchema = this.getPropertySchema();
    for (let key in propSchema) {
      this.removeProperty(key);
    }
    for (let key in props) {
      if (propSchema[key]) {
        this.setProperty(key, props[key]);
      }
    }

    // Sanitize actions: only add existing actions in the schema
    const actionSchema = this.getActionSchema();
    for (let key in actionSchema) {
      this.removeAction(key);
    }
    for (let key in actions) {
      if (actionSchema[key]) {
        this.setAction(key, new Action(solutionId, actions[key]));
      }
    }
  }

  clone() {
    const newObj = JSON.parse(stringify(this));
    delete newObj["_id"];
    const actions = {};
    newObj["actions"] = actions;

    const props = this.getActions();
    for (let key in props) {
      let prop = props[key];
      if (prop instanceof Action) {
        actions[key] = prop.clone();
      }
    }

    return new Action(this.getSolutionId(), newObj);
  }
}


class NodeReference {
  constructor(node, references) {
    this.node = node;
    this.references = references;
  }
}
class Screen extends RootNode {
  constructor(solution, nodeData) {
    super(solution, nodeData);
    this._type = this._type ?? "Screen";
  }

  get rootType() {
    return "Widget";
  }
  
  fromObject(screenData) {
    super.fromObject(screenData);
    const solutionId = this.getSolutionId();
    const schema = Editor.project.getSchema(solutionId);
    this.widgets = {};

    if (screenData) {
      const props = screenData["properties"] || screenData;
      const propsSchema = schema.getProperties(this) ?? {};
      for (let key in propsSchema) {
        if (props.hasOwnProperty(key)) {
          this.properties[key] = props[key];
        }
      }

      const widgets = screenData["widgets"] || screenData;
      const widgetSchema = schema.getWidgets(this) ?? {};
      for (let key in widgetSchema) {
        if (widgets.hasOwnProperty(key)) {
          this.widgets[key] = new Widget(solutionId, widgets[key]);
        }
      }

      const actions = screenData["actions"] || screenData;
      const actionSchema = schema.getActions(this) ?? {};
      for (let key in actionSchema) {
        if (actions.hasOwnProperty(key)) {
          this.actions[key] = new Action(solutionId, actions[key]);
        }
      }
    }
  }

  getWidget(key) {
    return this.widgets[key];
  }

  setWidget(key, widget) {
    this.widgets[key] = widget;
  }

  getBody() {
    return this.getWidget("body");
  }

  setBody(widget) {
    this.setWidget("body", widget);
  }

  findWidget(widgetId) {
    const body = this.getBody();
    if (!body)
      return null;
    if (body.getId() === widgetId)
      return body;
    return body.findWidget(widgetId);
  }

  clone() {
    var newObj = JSON.parse(stringify(this));
    delete newObj["_id"];
    const widgets = {};
    newObj["widgets"] = widgets;
    const actions = {};
    newObj["actions"] = actions;

    let props = this.widgets;
    for (let key in props) {
      let prop = this.getWidget(key);
      if (prop instanceof Widget) {
        widgets[key] = prop.clone();
      } else if (Array.isArray(prop)) {
        let arr = [];
        widgets[key] = arr;
        for (let i = 0; i < prop.length; i++) {
          if (prop[i] instanceof Widget) {
            arr[i] = prop[i].clone();
          }
        }
      }
    }
  
    props = this.actions;
    for (let key in props) {
      let prop = props[key];
      if (prop instanceof Action) {
        actions[key] = prop.clone();
      }
    }
  
    return new Screen(this.getSolutionId(), newObj);
  }
}

class Widget extends Node {
  constructor(solution, nodeData) {
    super(solution, nodeData);
  }

  get rootType() {
    return "Widget";
  }

  fromObject(objData) {
    super.fromObject(objData);
    if (!objData) {
      return;
    }

    const solutionId = this.getSolutionId();
    this.widgets = {};
    this._template = objData["_template"] ?? null;

    const props = objData["properties"] || {};
    const actions = objData["actions"] || {};
    const widgets = objData["widgets"] || {};

    if (this.isComponent()) {
      // Set this property before getting the schema, otherwise component exposed schema would not be loaded
      this.setProperty("component", props["component"]);
    }

    // Sanitize properties: only add existing properties in the schema
    const propSchema = this.getPropertySchema();
    for (let key in propSchema) {
      this.removeProperty(key);
    }
    for (let key in props) {
      if (propSchema[key]) {
        this.setProperty(key, props[key]);
      } else {
        console.warn(`Property ${key} not found in schema for type '${this.getType()}'`);
      }
    }

    // Sanitize actions: only add existing actions in the schema
    const actionSchema = this.getActionSchema();
    for (let key in actionSchema) {
      this.removeAction(key);
    }
    for (let key in actions) {
      if (actionSchema[key]) {
        this.setAction(key, new Action(solutionId, actions[key]));
      }
    }

    // Sanitize widgets: only add existing widgets in the schema
    const widgetSchema = this.getWidgetSchema();
    for (let key in widgetSchema) {
      this.removeWidget(key);
    }

    for (let key in widgets) {
      if (!widgetSchema[key]) {
        continue;
      }

      let value = widgets[key];
      if (Array.isArray(value)) {
        let arr = [];
        this.widgets[key] = arr;
        for (let obj of value)
          arr.push(new Widget(solutionId, obj));
      } else {
        this.widgets[key] = new Widget(solutionId, widgets[key]);
      }
    }
  }

  getPropertySchema() {
    const schema = {};
    if (this.isComponent()) {
      const componentSchema = this._getComponentExposedSchema(this.getProperty("component"), "property");
      Object.assign(schema, componentSchema);
    }
    Object.assign(schema, super.getPropertySchema());
    return schema;
  }

  getActionSchema() {
    let schema = super.getActionSchema();
    if (this.isComponent()) {
      const componentSchema = this._getComponentExposedSchema(this.getProperty("component"), "action");
      schema = Object.assign(schema, componentSchema);
    }
    return schema;
  }

  getWidgetSchema() {
    let schema = Editor.project.getSchema(this.getSolutionId()).getWidgets(this);
    if (this.isComponent()) {
      const componentSchema = this._getComponentExposedSchema(this.getProperty("component"), "widget");
      schema = Object.assign(schema, componentSchema);
    }
    return schema;
  }

  _getComponentExposedSchema(componentId, schemaType) {
    if (componentId) {
      const component = Editor.project.getComponent(componentId);
      if (component) {
        return component.getExposedPropertiesOfType(schemaType);
      } else {
        console.error(`Component '${componentId}' not found`)
      }
    }
    return {};
  }

  getWidgets() {
    return this.widgets;
  }

  getWidget(key) {
    return this.widgets[key];
  }

  setWidget(key, widget) {
    this.widgets[key] = widget;
  }

  removeWidget(key) {
    delete this.widgets[key];
  }

  findWidget(widgetId) {
    if (widgetId === this.getId())
      return this;
    
    for (let key in this.widgets) {
      let value = this.widgets[key];
      if (Array.isArray(value)) {
        for (let entry of value) {
          let widget = entry.findWidget(widgetId);
          if (widget)
            return widget;
        }
      } else if (value) {
        let widget = value.findWidget(widgetId);
        if (widget)
          return widget;
      }
    }
    return null;
  }

  getTemplate() {
    return Editor.project.getTemplate(this._template);
  }

  setTemplate(templateId) {
    this._template = templateId;
  }

  isComponent() {
    return this.getType() === "WidgetComponent" || this.getType() === "PreferredSizeComponent";
  }

  isOfType(typeName) {
    typeName = typeName.replace("[", "").replace("]", "");
    return Editor.project.getSchema(this.getSolutionId()).getWidgetInheritance(this.getType()).includes(typeName);
  }

  clone() {
    var newObj = JSON.parse(stringify(this));
    delete newObj["_id"];
    const widgets = {};
    newObj["widgets"] = widgets;
    const actions = {};
    newObj["actions"] = actions;

    let props = this.getWidgets();
    for (let key in props) {
      let prop = this.getWidget(key);
      if (prop instanceof Widget) {
        widgets[key] = prop.clone();
      } else if (Array.isArray(prop)) {
        let arr = [];
        widgets[key] = arr;
        for (let i = 0; i < prop.length; i++) {
          if (prop[i] instanceof Widget) {
            arr[i] = prop[i].clone();
          }
        }
      }
    }

    props = this.getActions();
    for (let key in props) {
      let prop = props[key];
      if (prop instanceof Action) {
        actions[key] = prop.clone();
      }
    }

    return this.createInstanceFromMap(this.getSolutionId(), newObj);
  }

  createInstanceFromMap(solutionId, objData) {
    return new Widget(solutionId, objData);
  }

  static create(solutionId, type) {
    return new Widget(solutionId, { _type: type });
  }
}



class WidgetDerivative extends Widget {
  constructor(solution, nodeData) {
    super(solution, nodeData);
    this.isRootNode = true;
    this._folder = this._folder ?? null;
    this.name = this.name ?? null;
  }

  fromObject(props) {
    super.fromObject(props);
    if (props) {
      this._folder = props["_folder"];
      this.name = props["name"];
    }
  }

  getFolder() {
    return this._folder;
  }

  setFolder(value) {
    this._folder = value;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }
}



class Template extends WidgetDerivative {
  constructor(solution, nodeData) {
    super(solution, nodeData);
  }

  getFriendlyType() {
    return "Template";
  }

  createInstanceFromMap(solutionId, objData) {
    return new Template(solutionId, objData);
  }

  setTemplate(templateId) {
    if (templateId !== this.getId()) {
      super.setTemplate(templateId);
    }
  }

  static create(solutionId, type) {
    return new Template(solutionId, { _type: type });
  }
}



class Component extends WidgetDerivative {
  constructor(solution, nodeData) {
    super(solution, nodeData);
  }

  fromObject(data) {
    super.fromObject(data);
    if (data) {
      this.exposedProperties = data["exposedProperties"] || {};
    }
  }

  getFriendlyType() {
    return "Component";
  }

  createInstanceFromMap(solutionId, objData) {
    return new Component(solutionId, objData);
  }

  getExposedPropertiesOfType(type) {
    const schema = {};
    // format: <widgetId>.<type(action, property, widget)>.key
    for (let key in this.exposedProperties) {
      let val = this.exposedProperties[key];
      if (val.split(".")[1] !== type) {
        continue;
      }

      let widgetId = val.split(".")[0];
      let widget = this.findWidget(widgetId);
      let widgetPropertyKey = val.replace(`${widgetId}.${type}.`, "");

      let childSchema;
      switch (type) {
        case "action":
          childSchema = widget.getActionSchema();
          break;
        case "property":
          childSchema = widget.getPropertySchema();
          break;
        case "widget":
          childSchema = widget.getWidgetSchema();
          break;
        default:
          continue;
      }

      if (childSchema[widgetPropertyKey]) {
        schema[key] = childSchema[widgetPropertyKey];
      }
    }
    return schema;
  }

  static create(solutionId, type) {
    return new Component(solutionId, { _type: type });
  }
}

class Editor {
  static schema = null;
  static _clientSchema = null;
  static project = null;
  static editMode = false;
  static selectedNode;
  static selectedRootNode;
  static solutionPanel = new SolutionPanel();
  static templatePanel = new TemplatePanel();
  static componentPanel = new ComponentPanel();
  static typePanel = new TypePanel();
  static widgetPanel = new WidgetPanel();
  static screenPanel = new ScreenPanel();
  static navigationPanel = new NavigationPanel();
  static flowPanel = new FlowPanel();
  static propertyPanel = new PropertyPanel();
  // this.actionPanel = new ActionPanel();
  static testPanel = new TestPanel();
  static jsonPanel = new JsonPanel();
  static footerPanel = new FooterPanel();
  static consolePanel = Editor.footerPanel.consolePanel;
  static searchPanel = Editor.footerPanel.searchPanel;
  static panels = [Editor.solutionPanel, Editor.templatePanel, Editor.componentPanel, Editor.typePanel, Editor.widgetPanel, Editor.screenPanel, Editor.navigationPanel,
    Editor.flowPanel, Editor.propertyPanel, /*Editor.actionPanel,*/ Editor.testPanel, Editor.jsonPanel, Editor.footerPanel];

  constructor() {
  }

  static _loadSolution() {
    let needsConfig = false;
    let filePathList = [];

    const updateAbsolutePath = () => {
      needsConfig = false;
      filePathList = [];
      for (let i = 0; i < this._clientSchema.length; i++) {
        let solution = this._clientSchema[i];
        if (solution.filePath) {
          let absolutePath = this._getSolutionAbsolutePath(solution);
          if (!absolutePath) {
            if (i === this._clientSchema.length - 1) {
              absolutePath = solution.filePath;
              window.localStorage.setItem(this._getSolutionAbsolutePathKey(solution), absolutePath);
            } else {
              needsConfig = true;
            }
          }
          solution.absolutePath = absolutePath;
          filePathList.push(absolutePath);
        }
      }
    };

    const loadFunction = async () => {
      const solutionsData = await (await fetch("loadSolutions", {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        body: stringify(filePathList)
      })).json();

      for (let solution of this._clientSchema) {
        solution.data = solutionsData.find(d => d.path === solution.absolutePath)?.data;
      }

      this.project = new Project();
      this.project.build(this._clientSchema);
      this.populate();

      return true;
    };

    updateAbsolutePath();
    if (needsConfig) {
      const tailFunction = () => {
        updateAbsolutePath();
        if (needsConfig) {
          showModalError("Error", "You must specify the path to all Solutions files.");
          return false;
        }
        loadFunction();
        return true;
      };

      const projectData = [];
      for (let schema of this._clientSchema) {
        projectData.push({
          name: schema.name,
          filePath: schema.filePath,
          schemaStats: {
            widgets: Object.keys(schema.widgets).length,
            actions: Object.keys(schema.actions).length,
            properties: Object.keys(schema.properties).length,
          }
        });
      }
      const form = this._buildSettingsForm(projectData);
      showModalForm("Missing settings", form, tailFunction, false);
    } else {
      loadFunction();
    }
  }

  static populate() {
    const topSolution = this.project.getTopSolution();
    document.getElementById("toolbar-solution-name").innerHTML = topSolution.name;

    const environmentSelect = document.getElementById("environmentSelect");
    environmentSelect.innerHTML = "";
    environmentSelect.onchange = () => this.callServer("setEnvironment", environmentSelect.value);
    for (let environment of topSolution.environmentData.environments) {
      const option = document.createElement("option");
      option.value = environment;
      option.innerHTML = environment;
      environmentSelect.appendChild(option);
    }

    const languageSelect = document.getElementById("languageSelect");
    languageSelect.innerHTML = "";
    languageSelect.onchange = () => this.callServer("setLanguage", languageSelect.value);
    for (let language of topSolution.stringResources.languages) {
      const option = document.createElement("option");
      option.value = language;
      option.innerHTML = language;
      languageSelect.appendChild(option);
    }

    this.selectedNode = null;
    this.selectedRootNode = null;

    for (let panel of this.panels) {
      panel.populate();
    }
    this.sendSolutionToClient();
    this.updateEnvironmentDatalist();
  }

  static showSettings() {
    const projectData = [];
    for (let solution of this.project.solutions) {
      projectData.push({
        id: solution.id,
        name: solution.name,
        filePath: solution.filePath,
        model: solution,
        schemaStats: this.project.getSchemaStats(solution.id),
      });
    }
    const form = this._buildSettingsForm(projectData);
    showModalForm("Settings and statistics", form);
  }

  static _buildSettingsForm(projectData) {
    const rootElement = document.createElement("div");

    const buildPathInput = (sol) => {
      const input = document.createElement("input");
      input.classList.add("modal-form-content-input");
      input.placeholder = sol.filePath;
      input.value = sol.absolutePath ?? this._getSolutionAbsolutePath(sol) ?? "";
      input.onchange = () => {
        sol.absolutePath = input.value;
        window.localStorage.setItem(this._getSolutionAbsolutePathKey(sol), input.value);
      }
      return input;
    };

    const buildlandingScreenInput = (sol) => {
      const input = document.createElement("select");
      let option = document.createElement("option");
      option.setAttribute("value", null);
      input.appendChild(option);

      for (const screen of Editor.project.getScreens(sol.id)) {
        option = document.createElement("option");
        option.setAttribute("value", screen.getId());
        option.innerHTML = screen.getName();
        input.appendChild(option);
      }

      input.value = sol.landingScreen;
      input.onchange = () => {
        sol.landingScreen = input.value;
      };
      return input;
    };

    let spacer;
    for (let solution of projectData) {
      if (solution.name === "Lowder") {
        continue;
      }

      if (spacer) {
        rootElement.appendChild(spacer);
      }

      let model = solution.model;
      let schemaStats = solution.schemaStats;

      let nameElement = document.createElement("label");
      nameElement.innerHTML = solution.name;
      rootElement.appendChild(nameElement);

      spacer = document.createElement("div");
      spacer.style.height = "5px";
      rootElement.appendChild(spacer);

      let table = document.createElement("table");
      rootElement.appendChild(table);

      if (model) {
        let label = document.createElement("td");
        label.classList.add("modal-form-content-label");
        label.innerHTML = "Model: ";
        let counter = document.createElement("td");
        counter.classList.add("modal-form-content-label");
        counter.innerHTML = `${model.screens?.length ?? 0} Screens, ${model.components?.length ?? 0} Components, ${model.templates?.length ?? 0} Templates`;
        let row = document.createElement("tr");
        row.appendChild(label);
        row.appendChild(counter);
        table.appendChild(row);
      }

      if (schemaStats) {
        let label = document.createElement("td");
        label.classList.add("modal-form-content-label");
        label.innerHTML = "Schema: ";
        let counter = document.createElement("td");
        counter.classList.add("modal-form-content-label");
        counter.innerHTML = `${schemaStats.widgets} Widgets, ${schemaStats.actions} Actions, ${schemaStats.properties} Properties`;
        let row = document.createElement("tr");
        row.appendChild(label);
        row.appendChild(counter);
        table.appendChild(row);
      }
      
      if (this.project) {
        let label = document.createElement("td");
        label.classList.add("modal-form-content-label");
        label.innerHTML = "Landing Screen: ";
        let inputTd = document.createElement("td");
        inputTd.appendChild(buildlandingScreenInput(model));
        let row = document.createElement("tr");
        row.appendChild(label);
        row.appendChild(inputTd);
        table.appendChild(row);
      }

      if (solution.filePath) {
        let label = document.createElement("td");
        label.classList.add("modal-form-content-label");
        label.innerHTML = "Model file: ";
        let inputTd = document.createElement("td");
        inputTd.appendChild(buildPathInput(solution));
        let row = document.createElement("tr");
        row.appendChild(label);
        row.appendChild(inputTd);
        table.appendChild(row);
      }
      
      spacer = document.createElement("div");
      spacer.style.height = "20px";
    }

    return rootElement;
  }

  static async saveSolution() {
    const dataToSave = [];
    for (let solution of this.project.solutions) {
      dataToSave.push({
        path: this._getSolutionAbsolutePath(solution),
        data: solution,
      });
    }

    await fetch("saveSolutions", {
      headers: { 'Content-Type': 'application/json' },
      method: "POST",
      body: stringify(dataToSave)
    });
    this.sendSolutionToClient();
  }

  static editEnvironmentVariables() {
    if (!this.project) {
      return;
    }

    let spacer;
    const tableHolder = document.createElement("column");
    for (let solution of this.project.solutions) {
      let environmentVariables = solution.environmentData;

      if (spacer) {
        tableHolder.appendChild(spacer);
      }

      let nameElement = document.createElement("label");
      nameElement.innerHTML = solution.name;
      tableHolder.appendChild(nameElement);

      let table = buildTable(environmentVariables.environments, environmentVariables.keys, environmentVariables.values);
      tableHolder.appendChild(table);

      spacer = document.createElement("div");
      spacer.style.height = "40px";
    }
    showModalForm("Environment Variables", tableHolder, () => {
      this.sendSolutionToClient();
      this.updateEnvironmentDatalist();
    }, false);
  }

  static updateEnvironmentDatalist() {
    const datalist = document.getElementById("env-datalist");
    datalist.innerHTML = "";
    for (let solution of this.project.solutions) {
      let environmentVariables = solution.environmentData;
      for (let key of environmentVariables.keys) {
        let option = document.createElement("option");
        option.value = key;
        datalist.appendChild(option);
      }
    }
  }

  static updateGlobalKeysDatalist(keys) {
    const datalist = document.getElementById("global-datalist");
    datalist.innerHTML = "";
    for (let key of keys) {
      let option = document.createElement("option");
      option.value = key;
      datalist.appendChild(option);
    }
  }

  static updateScreenStateDatalist() {
    if (!this.selectedNode) {
      return;
    }

    const datalist = document.getElementById("state-datalist");
    datalist.innerHTML = "";

    // User setted mock state for the current screen.
    let screenState = this.project.getTestData(this.selectedNode.getId());
    if (!screenState) {
      // Last known state for the current screen.
      screenState = window.localStorage.getItem(this.selectedNode.getId());
    }
    if (screenState) {
      screenState = JSON.parse(screenState);
    } else {
      return;
    }

    const buildMapOptions = (map, parentKey) => {
      for (let key of Object.keys(map)) {
        let value = map[key];
        let option = document.createElement("option");
        option.value = parentKey ? `${parentKey}.${key}` : key;
        datalist.appendChild(option);

        if (value && !Array.isArray(value) && typeof value === 'object') {
          buildMapOptions(value, option.value);
        }
      }
    };
    
    if (screenState && !Array.isArray(screenState) && typeof screenState === 'object') {
      buildMapOptions(screenState);
    }
  }

  static editStringResources() {
    if (!this.project) {
      return;
    }

    let spacer;
    const tableHolder = document.createElement("column");
    for (let solution of this.project.solutions) {
      let stringResources = solution.stringResources;

      if (spacer) {
        tableHolder.appendChild(spacer);
      }

      let nameElement = document.createElement("label");
      nameElement.innerHTML = solution.name;
      tableHolder.appendChild(nameElement);

      let table = buildTable(stringResources.languages, stringResources.keys, stringResources.values);
      tableHolder.appendChild(table);

      spacer = document.createElement("div");
      spacer.style.height = "40px";
    }
    showModalForm("String Resources", tableHolder, this.sendSolutionToClient.bind(this), false);
  }

  static importSwagger() {
    const form = document.createElement("table");

    let label = document.createElement("td");
    label.className = "modal-form-content-label";
    label.innerHTML = "Solution:";
    // TODO: options instead of input
    const solutionInput = document.createElement("select");
    solutionInput.className = "modal-form-content-input";
    for (let solution of this.project.solutions) {
      const option = document.createElement("option");
      option.value = solution.id;
      option.innerHTML = solution.name;
      solutionInput.appendChild(option);
    }
    let row = document.createElement("tr");
    row.appendChild(label);
    row.appendChild(solutionInput);
    form.appendChild(row);

    label = document.createElement("td");
    label.className = "modal-form-content-label";
    label.innerHTML = "Environment variable:";
    // TODO: options instead of input
    const varInput = document.createElement("input");
    varInput.placeholder = "eg: rest_api_uri";
    varInput.className = "modal-form-content-input";
    row = document.createElement("tr");
    row.appendChild(label);
    row.appendChild(varInput);
    form.appendChild(row);

    label = document.createElement("td");
    label.className = "modal-form-content-label";
    label.innerHTML = "From Url:";
    const urlInput = document.createElement("input");
    urlInput.className = "modal-form-content-input";
    urlInput.placeholder = "eg: http://some.address/swagger/v1/swagger.json";
    row = document.createElement("tr");
    row.appendChild(label);
    row.appendChild(urlInput);
    form.appendChild(row);

    label = document.createElement("td");
    label.className = "modal-form-content-label";
    label.innerHTML = "From File:";
    const fileInput = document.createElement("input");
    fileInput.className = "modal-form-content-input";
    fileInput.setAttribute("type", "file");
    fileInput.setAttribute("accept", ".json");
    fileInput.placeholder = "Pick a file";
    row = document.createElement("tr");
    row.appendChild(label);
    row.appendChild(fileInput);
    form.appendChild(row);

    showModalForm("Import from Swagger", form, async () => {
      if (!solutionInput.value || !varInput.value || (!urlInput.value && !fileInput.files.length > 0)) {
        showModalError("Error", "You're missing some inputs.");
        return false;
      } else {
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          try {
            Editor.internalImportSwagger(solutionInput.value, varInput.value, JSON.parse(await file.text()));
          } catch (e) {
            showModalError("Error importing Swagger from file.", e);
            return false;
          }
        } else {
          let response;
          try {
            response = await fetch(urlInput.value, { method: "GET" });
          } catch (e) {
            showModalError("Error importing Swagger from url", e);
            return false;
          }
          
          if (response.status === 200) {
            Editor.internalImportSwagger(solutionInput.value, varInput.value, await response.json());
            return true;
          } else {
            showModalError("Error importing Swagger from url", response.statusText);
            return false;
          }
        }
      }
    });
  }

  static internalImportSwagger(solutionId, uriVar, data) {
    const paths = data.paths;
    const models = data.components?.schemas;
    const solution = this.project.getSolution(solutionId);
    const existingTypes = solution.types;
    const existingFolders = solution.folders;

    if (models) {
      let folder = existingFolders.find(m => m.getName() === "Models");
      if (!folder) {
        folder = solution.createFolder();
        folder.setName("Models");
      }

      for (let name in models) {
        let model = existingTypes.find(m => m.getName() === name);
        if (!model) {
          model = solution.createType("KModel");
          model.setName(name);
          model.setFolder(folder.getId());
        }
        
        let props = models[name].properties;
        for (let key in props) {
          // TODO: convert Swagger type to Lowder type
          model.setProperty(key, props[key].type);
        }
        Editor.onNodeCreated("editor", model);
      }
    }

    if (paths) {
      for (let pathName in paths) {
        let verbs = paths[pathName];
        let fixedPathName = pathName.indexOf("/") === 0 ? pathName.substring(1) : pathName;

        for (let verb in verbs) {
          let requestName = verb + " " + fixedPathName;
          let request = existingTypes.find(m => m.getName() === requestName);
          
          if (!request) {
            request = solution.createType("KRequest");
            request.setName(requestName);

            let folderName = fixedPathName;
            if (verbs[verb].tags && verbs[verb].tags.length > 0) {
              folderName = verbs[verb].tags[0];
            }
            let folder = existingFolders.find(m => m.getName() === folderName);
            if (!folder) {
              folder = solution.createFolder();
              folder.setName(folderName);
            }
            request.setFolder(folder.getId());
          }
          request.setProperty("url", "${env." + uriVar + "}");
          request.setProperty("path", pathName);
          request.setProperty("method", verb);

          let queryParams = verbs[verb].parameters;
          if (queryParams && queryParams.length > 0) {
            let pathParamsModelName = requestName + " Params";
            let queryParamsModelName = requestName + " Query";
            
            for (let parameter of queryParams) {
              switch (parameter["in"]) {
                case "path":
                  let pathParamsModel = existingTypes.find(m => m.getName() === pathParamsModelName);
                  if (!pathParamsModel) {
                    pathParamsModel = solution.createType("KModel");
                    pathParamsModel.setName(pathParamsModelName);
                    pathParamsModel.setFolder(request.getFolder());
                    request.setProperty("pathParameters", { "_type": pathParamsModel.getId() });
                  }
                  pathParamsModel.setProperty(parameter["name"], "String");
                  break;
                case "query":
                  let queryParamsModel = existingTypes.find(m => m.getName() === queryParamsModelName);
                  if (!queryParamsModel) {
                    queryParamsModel = solution.createType("KModel");
                    queryParamsModel.setName(queryParamsModelName);
                    queryParamsModel.setFolder(request.getFolder());
                    request.setProperty("queryArgs", { "_type": queryParamsModel.getId() });
                  }
                  queryParamsModel.setProperty(parameter["name"], "String");
                  break;
              }
            }
          }

          let requestBody = verbs[verb].requestBody?.content;
          if (requestBody) {
            for (let key in requestBody) {
              let schema = requestBody[key]?.schema;
              if (schema["$ref"]) {
                let parts = schema["$ref"].split("/");
                let modelName = parts[parts.length -1];
                let model = existingTypes.find(m => m.getName() === modelName);
                if (model) {
                  request.setProperty("body", { "_type": model.getId() });
                }
              }
              break;
            }
          }

          Editor.onNodeCreated("editor", request);
        }
      }
    }
  }

  static showHelp() {
    const column = document.createElement("column");
    column.classList.add("modal-form-content-links");

    const editor = document.createElement("a");
    editor.setAttribute("href", "https://github.com/HCaseira/lowder_flutter/wiki/About-the-Editor");
    editor.setAttribute("target", "_blank");
    editor.innerHTML = "About the Editor";
    column.appendChild(editor);

    const wiki = document.createElement("a");
    wiki.setAttribute("href", "https://github.com/HCaseira/lowder_flutter/wiki/");
    wiki.setAttribute("target", "_blank");
    wiki.innerHTML = "Lowder Wiki";
    column.appendChild(wiki);

    const api = document.createElement("a");
    api.setAttribute("href", "https://pub.dev/documentation/lowder/latest/");
    api.setAttribute("target", "_blank");
    api.innerHTML = "Lowder API reference";
    column.appendChild(api);

    const flutter = document.createElement("a");
    flutter.setAttribute("href", "https://docs.flutter.dev/ui/widgets");
    flutter.setAttribute("target", "_blank");
    flutter.innerHTML = "Flutter Widget catalog";
    column.appendChild(flutter);

    showModalForm("Helpful Links", column);
  }

  static selectNode(node) {
    this.selectedNode = node;
    if (node.isRootNode) {
      this.selectedRootNode = node;
    }
    if (node instanceof Screen) {
      this.callServer("loadScreen", {
        id: node.getId(),
        state: this.getMockState(node.getId()),
      });
      this.updateScreenStateDatalist({ id: node.getId() });
    } else if (node instanceof Component) {
      this.callServer("loadComponent", node.getId());
    } else if (node instanceof Widget) {
      this.callServer("editorSelectWidget", node.getId());
    } if (node instanceof Solution) {
    }

    for (let panel of this.panels) {
      panel.selectNode(node);
    }
  }

  static onNodeCreated(origin, node) {
    for (let panel of this.panels) {
      panel.onNodeCreated(origin, node, this.selectedRootNode);
    }
  }

  static onNodeUpdated(origin, node) {
    for (let panel of this.panels) {
      panel.onNodeUpdated(origin, node, this.selectedRootNode);
    }

    if (node instanceof Template) {
      this.callServer("template", node);
    } else if (node instanceof Component) {
      this.callServer("component", node);
    } else if (node instanceof TypeNode) {
      this.callServer("request", node);
    } else if (node instanceof Screen) {
      this.callServer("screen", node);
    } else if (this.selectedRootNode && (node instanceof Widget || node instanceof Action)) {
      if (this.selectedRootNode instanceof Screen) {
        this.callServer("screen", this.selectedRootNode);
      } else if (this.selectedRootNode instanceof Component) {
        this.callServer("component", this.selectedRootNode);
      }
    }
  }

  static onNodeDeleted(origin, node) {
    for (let panel of this.panels) {
      panel.onNodeDeleted(origin, node, this.selectedRootNode);
    }
  }

  static async setEditMode(v) {
    this.editMode = v === "true";
    await this.callServer("editMode", this.editMode);
    // await sleep(2000);
    // await this.callServer("editorSelectWidget", this.selectedNode);
  }

  static sendSolutionToClient() {
    if (this.project) {
      this.callServer("solution", {
        solutions: [...this.project.solutions].reverse(),
        environment: document.getElementById("environmentSelect").value,
        language: document.getElementById("languageSelect").value,
        editMode: this.editMode,
        selectedNode: this.selectedNode?.getId(),
        state: this.getMockState(this.selectedNode?.getId())
      });
    }
  }

  static async callServer(command, value) {
    var data = {
      dataType: command,
      data: value
    };

    return await fetch("editor", {
      headers: { 'Content-Type': 'application/json' },
      method: "POST",
      body: stringify(data)
    });
  }

  static async init() {
    this.initPoll();
    // Wait for the client to connect before letting any action
    // const spinner = document.createElement("div");
    // spinner.className = "loader";
    // const spinnerMessage = document.createElement("span");
    // spinnerMessage.innerHTML = "Waiting for Flutter client to start.";
    // const spinnerHolder = document.createElement("column");
    // spinnerHolder.className = "spinner-holder";
    // spinnerHolder.appendChild(spinner);
    // spinnerHolder.appendChild(spinnerMessage);
    // const dismissFunction = showModalForm(null, spinnerHolder, null, false);

    // const loopFunction = () => {
    //   if (this._clientSchema) {
    //     dismissFunction();
    //     this._loadSolution();
    //     this.initKeys();
    //   } else {
    //     this.callServer("getSchema");
    //     window.setTimeout(loopFunction, 1000);
    //   }
    // };

    // window.setTimeout(loopFunction, 100);
  }

  static initKeys() {
    window.onkeydown = (e) => {
      if (e.ctrlKey) {
        if (e.key === "f") {
          e.preventDefault();
          this.doSearch();
        } else if (e.key === "s") {
          e.preventDefault();
          this.saveSolution();
        }
      }
    };
  }

  static async initPoll() {
    while (true) {
      try {
        let response = await fetch("editor", {
          headers: { 'Content-Type': 'application/json' },
          method: "GET"
        });
        if (response.status === 200) {
          let json;
          try {
            json = await response.json();
          } catch {
            // An empty response
          }
          if (json) {
            if (Array.isArray(json)) {
              for (let message of json) {
                this.handleClientMessage(message);
              }
            } else {
              this.handleClientMessage(json);
            }
          }
        }
        await sleep(100);
      }
      catch (e) {
        console.error(`Error calling Lowder Server: ${e}`);
      }
    }
  }

  static handleClientMessage(message) {
    switch (message.dataType) {
      case "log":
        Editor.consolePanel.onLog(message.data);
        break;
      case "clientSelectWidget":
        const node = this.project.findWidget(message.data);
        if (node) {
          this.selectNode(node);
        }
        break;
      case "clientSchema":
        if (this.project) {
          this.project.updateSchema(message.data);
          this.sendSolutionToClient();
        } else if (!this._clientSchema) {
          this._clientSchema = message.data;
        }
        break;
      case "clientLoaded":
        this.sendSolutionToClient();
        break;
      case "globalVars":
        this.updateGlobalKeysDatalist(message.data["keys"]);
        break;
      case "screenInit":
        this.onScreenInit(message.data);
        break;
    }
  }

  static onScreenInit(data) {
    const screenId = data.id;
    const screenState = data.state;
    if (screenId && screenState) {
      try {
        if (Object.keys(screenState).length === 0) {
          return;
        }

        window.localStorage.setItem(screenId, stringify(screenState));
        if (screenId === this.selectedNode?.getId()) {
          this.updateScreenStateDatalist();
        }
      } catch(e) {
        this.logError("Error storing Screen state.", null, null, null, e);
      }
    }
  }

  static clipboardPut(obj) {
    this.storedObject = obj;
  }

  static clipboardGet() {
    return this.storedObject;
  }

  static logInfo(message, node, parentNode, rootNode) {
    this._log("info", message, node, parentNode, rootNode);
  }

  static logWarn(message, node, parentNode, rootNode) {
    this._log("warn", message, node, parentNode, rootNode);
  }

  static logError(message, node, parentNode, rootNode, error, stackTrace) {
    this._log("error", message, node, parentNode, rootNode, error, stackTrace);
  }

  static _log(type, message, node, parentNode, rootNode, error, stackTrace) {
    const dt = new Date();
    const dateTime = `${dt.getFullYear()}-${`${dt.getMonth()}`.padStart(2, "0")}-${`${dt.getDay()}`.padStart(2, "0")} ${`${dt.getHours()}`.padStart(2, "0")}:${`${dt.getMinutes()}`.padStart(2, "0")}:${`${dt.getSeconds()}`.padStart(2, "0")}.${`${dt.getMilliseconds()}`.padStart(3, "0")}`;
    rootNode = rootNode || this.selectedRootNode;

    const context = {};
    if (node) {
      context["node"] = {
        id: node.getId(),
        type: node.getType(),
        name: node.getName(),
      }
    }
    if (parentNode) {
      context["parentNode"] = {
        id: parentNode.getId(),
        type: parentNode.getType(),
        name: parentNode.getName(),
      }
    }
    if (rootNode) {
      context["rootNode"] = {
        id: rootNode.getId(),
        type: rootNode.getType(),
        name: rootNode.getName(),
      }
    }

    Editor.consolePanel.onLog({
      type: type,
      origin: "editor",
      message: `${dateTime} ${message}`,
      context: context,
      error: error,
      stackTrace: stackTrace
    });
  }

  static _getSolutionAbsolutePathKey(solution) {
    return solution.name + "_" + solution.filePath;
  }

  static _getSolutionAbsolutePath(solution) {
    return window.localStorage.getItem(this._getSolutionAbsolutePathKey(solution));
  }

  static getMockState(screenId) {
    if (!screenId) {
      return null;
    }

    const mockState = this.project.getTestData(screenId);
    if (!mockState) {
      return null;
    }

    try {
      return JSON.parse(mockState);
    } catch {
      return null;
    }
  }

  static doSearch(text) {
    this.searchPanel.doSearch(text);
    FooterPanel.show();
  }
}
