/**
 *  This plugin adds various custom layouts using twitter foundation grid system.
 *  Author: Radoslav Petkov modified for Foundation by Nour Akalay
 **/
'use strict';

CKEDITOR.plugins.add('foundationlayoutmanager', {
    requires: 'basewidget',
    icons: 'addfoundationlayout',
    lang: 'en,bg',
    init: pluginInit
});

/**
 * Config variables
 * config.foundationlayoutmanager_loadfoundation   By default is set to false, otherwise loads the embedded foundation style.
 * config.foundationlayoutmanager_allowedContent  By default is set to allow all tags.
 * config.foundationlayoutmanager_buttonBoxWidth  The width of each layout-preview button in the dialog.
 * config.foundationlayoutmanager_columnStart  The Foundation 5 grid device breakpoint: small, medium, large.
 */
function pluginInit(editor) {
    if (editor.config.foundationlayoutmanager_loadfoundation) {
        CKEDITOR.document.appendStyleSheet(this.path + 'css/foundation.min.css');
    }

    var foundationLayoutManager = new FoundationLayoutManager(editor);
    foundationLayoutManager.generateWidgets();

    //Creates local namespace for the plugin to share data.
    editor.foundationlayoutmanager = {};

    var allowedContent;
    if (editor.config.foundationlayoutmanager_allowedContent) {
        allowedContent = editor.config.foundationlayoutmanager_allowedContent();
    } else {
        allowedContent = 'p a div span h2 h3 h4 h5 h6 section article iframe object embed strong b i em cite pre blockquote small sub sup code ul ol li dl dt dd table thead tbody th tr td img caption mediawrapper br[href,src,target,width,height,colspan,span,alt,name,title,class,id,data-options]{text-align,float,margin}(*)';
    }
    foundationLayoutManager.setAllowedContent(allowedContent);

    var addFoundationLayoutDialog = foundationLayoutManager.addFoundationLayoutDialog.bind(foundationLayoutManager);
    var manageFoundationLayoutDialog = foundationLayoutManager.manageFoundationLayoutDialog.bind(foundationLayoutManager);

    CKEDITOR.dialog.add('addFoundationLayoutDialog' + editor.name, addFoundationLayoutDialog);
    CKEDITOR.dialog.add('manageFoundationLayoutDialog' + editor.name, manageFoundationLayoutDialog);

    editor.addCommand('addfoundationlayout',
        new CKEDITOR.dialogCommand('addFoundationLayoutDialog' + editor.name, {
            allowedContent: allowedContent
        }));

    editor.addCommand('managefoundationlayout',
        new CKEDITOR.dialogCommand('manageFoundationLayoutDialog' + editor.name, {
            allowedContent: allowedContent
        }));

    editor.ui.addButton('AddFoundationLayout', {
        title: editor.lang.foundationlayoutmanager.title,
        command: 'addfoundationlayout'
    });
}

/**
 *   FoundationLayoutManager class implementing all layout functionalities.
 *   Author: Radoslav Petkov
 *
 *   Variables stored into the editor's object:
 *   {ckeditor.dom.element} editor.foundationlayoutmanager.selectedLayout.wrapper The selected widget wrapper element.
 *   {ckeditor.dom.element} editor.foundationlayoutmanager.selectedLayout.widget The selected widget instance.
 */
function FoundationLayoutManager(editor) {
    this.editor = editor;

    var columnStart = editor.config.foundationlayoutmanager_columnStart;
    if (columnStart === undefined) {
        columnStart = 'small';
    }
    this.setColumnStart(columnStart);

    this.foundationLayoutBuilder = new FoundationLayoutBuilder(columnStart);
    if (!editor.config.foundationlayoutmanager_buildDefaultLayouts) {
        this.foundationLayoutBuilder.buildDefaultLayouts();
    }
}

FoundationLayoutManager.prototype.setAllowedContent = function(allowedContent) {
    this.allowedContent = allowedContent;
};

FoundationLayoutManager.prototype.setColumnStart = function(columnStart) {
    this.columnStart = columnStart;
};
/**
 * The button's view should be small representation of the actual layout.
 * In order to accomplish it ckeditor's styles should be overrided by adding hardcoded styles to the elements
 * such as width,height,border and position.
 *
 * @param {integer} columns The count of the columns.
 * @param {integer array}  columnsSizes Holds the size of each column in ratio columnsSizes[i] : 12.
 */
FoundationLayoutManager.prototype.createButtonView = function(columns, columnsSizes) {
    var colWidth = [];
    var boxWidth = 58;
    if (this.editor.config.foundationlayoutmanager_buttonBoxWidth) {
        boxWidth = editor.config.foundationlayoutmanager_buttonBoxWidth;
    }
    var seedWidth = ((boxWidth - 2) / 12); // Substracts two pixels for the left and right border
    for (var i = 1; i <= 12; i++) {
        colWidth[i] = (seedWidth * i);
    }
    var html = '<div>';
    for (var i = 0; i < columns; i++) {
        // If the column is not in the beginning set the border-left to 0.
        // The height of the button is set on 30px.
        html = html.concat('<div style="cursor:pointer;border:1px solid #778899;float:left;position:relative;background:#B0C4DE;text-align:center;height:30px;line-height: 30px;width:' + (colWidth[columnsSizes[i]] - 1) + 'px;' + ((i != 0) ? 'border-left:none' : '') + ' "> ' + '</div>');
    }
    html = html.concat('</div>');
    return {
        html: html,
        width: boxWidth
    }
};

FoundationLayoutManager.prototype.createButton = function(type, action) {
    var cols = type.split("/");
    var button = this.createButtonView(cols.length, cols);
    return {
        type: 'html',
        id: "foundation" + type,
        html: button.html,
        className: " ",
        style: 'width:' + button.width + 'px;',
        onClick: function(evt) {
            action("foundation" + type);
            this._.dialog.hide();
        }
    };
};

/**
 *  Create button for each layout
 */
FoundationLayoutManager.prototype.generateButtonObjects = function(action) {
    var layouts = this.foundationLayoutBuilder.getLayouts();
    var rows = {};
    for (var type in layouts) {
        if (layouts.hasOwnProperty(type)) {
            var button = this.createButton(type, action);
            if (!rows.hasOwnProperty(layouts[type].rowPosition)) {
                rows[layouts[type].rowPosition] = [];
            }
            rows[layouts[type].rowPosition].push(button);
        }
    }
    return rows;
};

FoundationLayoutManager.prototype.createDialogDefinition = function(title, minWidth, minHeight, buttonsObjects) {
    var elementsRows = [];
    for (var row in buttonsObjects) {
        if (buttonsObjects.hasOwnProperty(row)) {
            elementsRows.push({
                type: 'hbox',
                id: ('row' + row),
                children: buttonsObjects[row]
            });
        }
    }
    return {
        title: title,
        minWidth: minWidth,
        minHeight: minHeight,
        resizable: CKEDITOR.DIALOG_RESIZE_NONE,
        buttons: [CKEDITOR.dialog.cancelButton],
        contents: [{
            elements: elementsRows
        }]
    };
};

FoundationLayoutManager.prototype.insertLayoutAction = function(name) {
    this.editor.execCommand(name);
};

FoundationLayoutManager.prototype.addFoundationLayoutDialog = function() {
    var width = 200;
    var height = 100;
    var layouts = this.generateButtonObjects(this.insertLayoutAction.bind(this));

    return this.createDialogDefinition(this.editor.lang.foundationlayoutmanager.addLayoutDialogTitle, width, height, layouts);
};

FoundationLayoutManager.prototype.changeLayoutAction = function(newLayoutName) {

    var newColumns = newLayoutName.replace('foundation', '').split('/');
    var newColumnsCount = newColumns.length;
    var selectedWidget = this.widget;
    selectedWidget.name = newLayoutName;
    var currentlySelectedLayoutWidgetElement = selectedWidget.element;
    var row = currentlySelectedLayoutWidgetElement.getChildren().getItem(0);
    var columns = row.getChildren();
    var columnsCount = columns.count();

    var attributeTemplate = [];

    attributeTemplate.push(this.layoutManager.columnStart + '-{size}');
    attributeTemplate.push('columns');
    var pattern = /(small|medium|large)-/;

    if (newColumnsCount <= columnsCount) {
        for (var i = 0; i < newColumnsCount; i++) {
            var currentColumn = columns.getItem(i);
            var attributeString = currentColumn.getAttribute('class');
            var attributes = attributeString.split(' ');
            for (var j = 0; j < attributes.length; j++) {
                if (pattern.test(attributes[j])) {
                    currentColumn.removeClass(attributes[j]);
                }
            }
            for (var j = 0; j < attributeTemplate.length; j++) {
                currentColumn.addClass(attributeTemplate[j].replace('{size}', newColumns[i]));
            }
        }
        for (var i = columnsCount - 1; i >= newColumnsCount; i--) {
            var lastColumn = columns.getItem(i);
            var penult = columns.getItem(i - 1);
            lastColumn.moveChildren(penult);
            lastColumn.remove();
        }
    } else {
        for (var i = 0; i < columnsCount; i++) {
            var currentColumn = columns.getItem(i);
            var attributeString = currentColumn.getAttribute('class');
            var attributes = attributeString.split(' ');
            for (var j = 0; j < attributes.length; j++) {
                if (pattern.test(attributes[j])) {
                    currentColumn.removeClass(attributes[j]);
                }
            }
            for (var j = 0; j < attributeTemplate.length; j++) {
                currentColumn.addClass(attributeTemplate[j].replace('{size}', newColumns[i]));
            }
        }
        for (var i = columnsCount; i < newColumnsCount; i++) {
            var insertedCol = new CKEDITOR.dom.element('div');
            insertedCol.addClass('foundation-layout-column');
            for (var j = 0; j < attributeTemplate.length; j++) {
                insertedCol.addClass(attributeTemplate[j].replace('{size}', newColumns[i]));
            }
            // Generate unique id for the editable
            // Due to this issue http://dev.ckeditor.com/ticket/12524
            var uniqueId = new Date().getTime() + Math.floor((Math.random() * 100) + 1);
            insertedCol.addClass('foundationColumnEditable' + uniqueId);
            row.append(insertedCol);
            selectedWidget.initEditable(uniqueId, {
                selector: '.foundationColumnEditable' + uniqueId + ''
            });
        }
    }
};

FoundationLayoutManager.prototype.manageFoundationLayoutDialog = function() {
    var width = 200;
    var height = 100;
    var layouts = this.generateButtonObjects(this.changeLayoutAction.bind({
        widget: this.editor.foundationlayoutmanager.selectedWidget,
        layoutManager: this
    }));
    return this.createDialogDefinition(this.editor.lang.foundationlayoutmanager.manageLayoutDialogTitle, width, height, layouts);
};

FoundationLayoutManager.prototype.createWidget = function(name, definition) {
    CKEDITOR.basewidget.addWidget(this.editor, name, definition);
};

FoundationLayoutManager.prototype.createWidgetDefinition = function(_template, _editables, _upcast, _allowedContent) {
    return {
        template: _template,
        extend: {
            init: function() {

            }
        },
        configuration: {
            init: {
                blockEvents: false,
                configToolbar: {
                    defaultButtons: {
                        edit: {
                            onClick: function() {
                                this.editor.foundationlayoutmanager.selectedWidget = this;
                                this.editor.execCommand('managefoundationlayout');
                            }
                        }
                    }
                },
                onDestroy: function() {

                }
            }
        },
        editables: _editables,
        upcast: _upcast,
        allowedContent: _allowedContent
    };
};

FoundationLayoutManager.prototype.generateWidgets = function() {
    var layouts = this.foundationLayoutBuilder.getLayouts();
    this.editables = {
        layoutColumn1: {
            selector: '.foundation-layout-column-one',
            allowedContent: this.allowedContent
        },
        layoutColumn2: {
            selector: '.foundation-layout-column-two',
            allowedContent: this.allowedContent
        },
        layoutColumn3: {
            selector: '.foundation-layout-column-three',
            allowedContent: this.allowedContent
        }
    };
    var upcast = function(element) {
        return (element.hasClass('foundation-layout-container'));
    }

    for (var type in layouts) {
        if (layouts.hasOwnProperty(type)) {
            var widgetDefinition = this.createWidgetDefinition(layouts[type].template, this.editables, upcast, this.allowedContent);
            this.createWidget("foundation" + type, widgetDefinition);
        }
    }
};

FoundationLayoutManager.prototype.removeLayoutWidget = function() {
    this.editor.foundationlayoutmanager.selectedLayout.widget.repository.del(this.editor.foundationlayoutmanager.selectedLayout.widget);
};

/**
 *  Class that builds the default templates of the layouts. It is also used to hold all available
 *  layout templates and provide them for use in the widget creation.
 */
function FoundationLayoutBuilder(columnStart) {
    var defaultLayoutTemplates = [];
    defaultLayoutTemplates.push(new CKEDITOR.template(
        '<div class="foundation-layout-container">' +
        '<div class="row layout-row" >' +
        '<div class="foundation-layout-column-one ' + columnStart + '-{size1} columns foundation-layout-column">' +
        '<p></p>' +
        '</div>' +
        '</div>' +
        '</div>'
    ));
    defaultLayoutTemplates.push(new CKEDITOR.template(
        '<div class="foundation-layout-container">' +
        '<div class="row layout-row" >' +
        '<div class="foundation-layout-column-one ' + columnStart + '-{size1} columns foundation-layout-column">' +
        '<p></p>' +
        '</div>' +
        '<div class="foundation-layout-column-two ' + columnStart + '-{size2} columns foundation-layout-column">' +
        '<p></p>' +
        '</div>' +
        '</div>' +
        '</div>'
    ));
    defaultLayoutTemplates.push(new CKEDITOR.template(
        '<div class="foundation-layout-container">' +
        '<div class="row layout-row" >' +
        '<div class="foundation-layout-column-one ' + columnStart + '-{size1} columns foundation-layout-column">' +
        '<p></p>' +
        '</div>' +
        '<div class="foundation-layout-column-two ' + columnStart + '-{size2} columns foundation-layout-column">' +
        '<p></p>' +
        '</div>' +
        '<div class="foundation-layout-column-three ' + columnStart + '-{size3} columns foundation-layout-column">' +
        '<p></p>' +
        '</div>' +
        '</div>' +
        '</div>'
    ));

    var defaultFoundationLayoutTypes = [];
    defaultFoundationLayoutTypes.push("12");
    defaultFoundationLayoutTypes.push("6/6");
    defaultFoundationLayoutTypes.push("9/3");
    defaultFoundationLayoutTypes.push("3/9");
    defaultFoundationLayoutTypes.push("8/4");
    defaultFoundationLayoutTypes.push("4/8");
    defaultFoundationLayoutTypes.push("7/5");
    defaultFoundationLayoutTypes.push("5/7");
    defaultFoundationLayoutTypes.push("4/4/4");
    defaultFoundationLayoutTypes.push("6/3/3");
    defaultFoundationLayoutTypes.push("3/6/3");
    defaultFoundationLayoutTypes.push("3/3/6");

    var layouts = {};

    var trim = function(str) {
        // removes newline / carriage return
        str = str.replace(/\n/g, "");
        // removes whitespace (space and tabs) before tags
        str = str.replace(/[\t ]+\</g, "<");
        // removes whitespace between tags
        str = str.replace(/\>[\t ]+\</g, "><");
        // removes whitespace after tags
        str = str.replace(/\>[\t ]+$/g, ">");
        return str;
    };

    /**
     *  Injects columns sizes taken from the type of the layout.
     *  @param {CKEDITOR.template} template - The template that will be injected with values.
     */
    var getTemplateWithValue = function(template, type) {
        var cols = type.split("/");
        var injectTemplate = {};

        for (var i = 0; i < cols.length; i++) {
            injectTemplate["size" + (i + 1)] = cols[i];
        }
        return trim(template.output(injectTemplate));
    };

    var addLayout = function(template, type, buttonRowPosition) {
        layouts[type] = {
            template: getTemplateWithValue(template, type),
            rowPosition: buttonRowPosition
        };
    };

    this.addLayout = function(type, buttonRowPosition) {
        var columnCount = type.split('/').length;
        addLayout(defaultLayoutTemplates[columnCount - 1], type, buttonRowPosition);
    };

    this.buildDefaultLayouts = function() {
        var row = 0;
        for (var i = 0; i < defaultFoundationLayoutTypes.length; i++) {
            // This count to which row in the choose dialog should the layout button be added
            if (i % 4 == 0) {
                row += 1;
            }
            var columnCount = defaultFoundationLayoutTypes[i].split('/').length;
            addLayout(defaultLayoutTemplates[columnCount - 1], defaultFoundationLayoutTypes[i], row);
        }
    };

    this.getLayout = function(type) {
        return layouts[type];
    };

    this.getLayouts = function() {
        return layouts;
    };
}