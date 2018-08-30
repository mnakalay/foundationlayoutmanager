# Foundation Layout Manager for CKEditor

This is a rewrite of [CKEditor's Bootstrap based Layout Manager plugin](https://github.com/radpet/ckeditor-layoutmanager "CKEditor Layout Manager Plugin on Github") to work with the **Foundation 5 grid system**.

It also fixes a few bugs the original has:

- CSS was not loaded properly while editing
- An error was thrown on removing a grid

Additionally it loads a minified version of Foundation 5 grid CSS only as opposed to the whole unminified framework as the original plugin did.

This version of the plugin can be installed alongside the original Bootsrap based one.

It also works very nicely with [Concrete5 CKEditor plugin installer](http://www.concrete5.org/marketplace/addons/ckeditor-pluginator/ "Get Concrete5 CKEditor plugin installer on concrete5.org") (a.k.a. Content Editor Pluginator) for Foundation based themes.

## Configuration

#### config.extraPlugins = "foundationlayoutmanager"

#### config.foundationlayoutmanager_loadfoundation = true/false (false by default - embedded foundation.min.css is not loaded)
#### config.foundationlayoutmanager_allowedContent (all tags are allowed by default)
#### config.foundationlayoutmanager_buttonboxWidth = 58 (the width of each layout-preview button in the dialog)

#### Name for adding into the toolbar : "FoundationLayoutManager"