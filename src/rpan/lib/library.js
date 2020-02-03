/**
 * Initialization Code and shared classes of library sap.ui.suite.
 */
sap.ui.define(
	[
		"sap/ui/core/library" // library dependency
	],
	function() {
		"use strict";

		/**
		 * Library containing mobile controls/components.
		 *
		 * @namespace
		 * @name    rpan.lib
		 * @author  Robin Panneels
		 * @version 0.0.1
		 * @public
		 */

		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "rpan.lib",
			version: "0.0.1",
			dependencies: ["sap.ui.core", "sap.m", "sap.ui.unified"],
			types: [],
			interfaces: [],
			controls: [
				"rpan.lib.UploadCollection"
			],
			elements: [],
			noLibraryCSS: true
		});

		return rpan.lib;
	},
	/* bExport= */ false
);
