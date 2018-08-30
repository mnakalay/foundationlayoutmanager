# Foundation Layout Manager for CKEditor

This is a **CKEditor plugin to insert Foundation based grids** in your content.

It uses the widget plugin so adding and editing grids is easy through a simple interface.

**You are given a choice of 12 different layouts:**

- 1 full-width column
- 7 two-columns layouts
    - 3/9 and 9/3
    - 4/8 and 8/4
    - 5/7 and 7/5
    - 6/6
- 4 three-columns layouts
    - 3/3/6
    - 3/6/3
    - 4/4/4
    - 6/3/3

## Origin of the project

This is a rewrite of [CKEditor's Bootstrap based Layout Manager plugin](https://github.com/radpet/ckeditor-layoutmanager "CKEditor Layout Manager Plugin on Github") built to work with the **Foundation 5 grid system**.

It also fixes a few bugs the original has:

- CSS was not loaded properly while editing
- An error was thrown on removing a grid

Additionally it loads a minified version of Foundation 5 grid CSS only as opposed to the whole unminified framework as the original plugin did.

This version of the plugin can be installed alongside the original Bootstrap based one.

## Concrete5 CKEditor plugin installer

It also works very nicely with [Concrete5 CKEditor plugin installer](http://www.concrete5.org/marketplace/addons/ckeditor-pluginator/ "Get Concrete5 CKEditor plugin installer on concrete5.org") (a.k.a. Content Editor Pluginator) for Foundation based themes.

Ths plugin was actually a request from a user of Concrete5 CKEditor plugin installer.

## Configuration

**config.extraPlugins = "foundationlayoutmanager"**

**config.foundationlayoutmanager_loadfoundation = true/false** *(false by default - embedded foundation.min.css is not loaded)*

**config.foundationlayoutmanager_allowedContent** *(all tags are allowed by default)*

**config.foundationlayoutmanager_buttonboxWidth = 58** *(the width of each layout-preview button in the dialog)*

**Name for adding into the toolbar : "FoundationLayoutManager"**