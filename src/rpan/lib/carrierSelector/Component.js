sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/Text",
	"sap/m/TableSelectDialog",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Link"
], function(UIComponent, Text, TableSelectDialog, ColumnListItem, Column, Link) {
	"use strict";

	const CarrierSelector = UIComponent.extend(
		"rpan.lib.carrierSelector.Component",
		/** @lends rpan.lib.carrierSelector.Component.prototype **/ {
			metadata: {
				manifest: "json",
				properties: {
					isMultiSelect: {
						type: "boolean",
						group: "Behavior",
						defaultValue: false
					}
				},
				aggregations: {},
				events: {
					carriersSelected: {
						parameters: {
							carriers: { type: "object[]" }
						}
					}
				}
			}
		}
	);

	//=============================================================================
	// LIFECYCLE APIS
	//=============================================================================

	/**
	 * Initialization of the component
	 *
	 * @method		init
	 * @author		Robin Panneels
	 * @memberof	rpan.lib.carrierSelector.Component
	 * @public
	 * @override
	 */
	CarrierSelector.prototype.init = function () {
		this._readComponentData(this.getComponentData());
		this._resourceBundle = this.getModel("i18n").getResourceBundle();

		UIComponent.prototype.init.apply(this, arguments);
	};

	CarrierSelector.prototype.createContent = function () {
		return this._getDialog();
	};

	CarrierSelector.prototype.destroy = function () {
		if (this._carrierDialog) {
			this._carrierDialog.destroy();
		}

		UIComponent.prototype.destroy.apply(this, arguments);
	};

	//============================================================================
	// PUBLIC APIS
	//=============================================================================

	//=============================================================================
	// EVENT HANDLERS
	//=============================================================================

	CarrierSelector.prototype.onSearchCarriers = function (event) {
		debugger;
	};

	CarrierSelector.prototype.onConfirmDialog = function (event) {
		debugger;
	};

	CarrierSelector.prototype.onCancelDialog = function (event) {
		debugger;
	};

	//=============================================================================
	// PRIVATE APIS
	//=============================================================================

	CarrierSelector.prototype._readComponentData = function (componentData) {
		if (typeof componentData.isMultiSelect === "boolean")
			this.setIsMultiSelect(componentData.isMultiSelect);
	};

	CarrierSelector.prototype._getDialog = function () {
		if (!this._carrierDialog) {
			this._carrierDialog = this._createDialog();
		}

		return this._carrierDialog;
	};

	CarrierSelector.prototype._createDialog = function () {
		let dialog = new TableSelectDialog(
			this.createId("carrierTableSelectDialog"),
			{
				noDataText: this._resourceBundle.getText("dialog.no.data"),
				title: this._resourceBundle.getText("dialog.title"),
				multiSelect: this.getIsMultiSelect(),
				search: this.onSearchCarriers.bind(this),
				confirm: this.onConfirmDialog.bind(this),
				cancel: this.onCancelDialog.bind(this)
			}
		);

		dialog.bindItems({
			path: "carriers>/CarrierCollection",
			templateShareable: true,
			template: this._getTemplate()
		});
	};

	CarrierSelector.prototype._getTemplate = function () {
		return new ColumnListItem({
			columns: [
				new Column({
						text: this._resourceBundle.getText("column.carrier")
					}),
				new Column({
					header: {
						text: this._resourceBundle.getText("column.url")
					}
				}),
				new Column({
					header: {
						text: this._resourceBundle.getText("column.currency")
					}
				})
			],
			cells: [
				new ObjectIdentifier({
					title: "{carriers>AirlineName}",
					text: "{carriers>AirlineID}"
				}),
				new Link({
					text: "{carriers>URL}"
				}),
				new Text({
					text: "{carriers>LocalCurrencyCode}"
				})
			]
		})
	};


	return CarrierSelector;

});
