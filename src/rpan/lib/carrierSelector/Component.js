sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/Text",
	"sap/m/TableSelectDialog",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Link",
	"sap/m/ObjectIdentifier",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(UIComponent, Text, TableSelectDialog, ColumnListItem, Column, Link, ObjectIdentifier, Filter, FilterOperator) {
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

	CarrierSelector.prototype.openDialog = function () {
		this._carrierDialog.open();
	};

	//=============================================================================
	// EVENT HANDLERS
	//=============================================================================

	CarrierSelector.prototype.onSearchCarriers = function (event) {
		const searchValue = event.getParameter("value");
		const filter = new Filter("AirLineName", FilterOperator.Contains, searchValue);
		const binding = event.getSource().getBinding("items");
		binding.filter([filter]);
	};

	CarrierSelector.prototype.onConfirmDialog = function (event) {
		// reset the filter
		var binding = event.getSource().getBinding("items");
		binding.filter([]);

		const contexts = event.getParameter("selectedContexts");
		if (contexts && contexts.length) {
			this.fireCarriersSelected({
				carriers: contexts.map(context => context.getObject())
			});
		}
	};

	CarrierSelector.prototype.onCancelDialog = function (event) {
		// reset the filter
		var binding = event.getSource().getBinding("items");
		binding.filter([]);
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
				cancel: this.onCancelDialog.bind(this),
				columns: [
					new Column({
						header: new Text({text: this._resourceBundle.getText("column.carrier")})
					}),
					new Column({
						header: new Text({text: this._resourceBundle.getText("column.url")})
					}),
					new Column({
						header: new Text({text: this._resourceBundle.getText("column.currency")})
					})
				]
			}
		);

		dialog.bindItems({
			path: "carriers>/CarrierCollection",
			templateShareable: true,
			template: this._getTemplate()
		});

		return dialog;
	};

	CarrierSelector.prototype._getTemplate = function () {
		return new ColumnListItem({
			cells: [
				new ObjectIdentifier({
					title: "{carriers>AirLineName}",
					text: "{carriers>AirLineID}"
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
