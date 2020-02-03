sap.ui.define(
	["sap/m/UploadCollectionRenderer", "sap/ui/core/Renderer"],
	function(UploadCollectionRenderer, Renderer) {
		"use strict";

		/**
		 * CustomListItem renderer.
		 * @namespace
		 */
		let myUploadCollectionRenderer = Renderer.extend(
			UploadCollectionRenderer
		);

		return myUploadCollectionRenderer;
	},
	/* bExport= */ true
);
