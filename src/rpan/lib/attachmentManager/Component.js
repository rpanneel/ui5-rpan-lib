sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/ui/core/Fragment",
		"rpan/lib/UploadCollection",
		"sap/m/UploadCollectionItem",
		"sap/m/UploadCollectionParameter",
		"sap/m/ObjectAttribute",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/m/Button",
		"sap/base/Log",
		"sap/ui/core/format/FileSizeFormat"
	],
	function(
		UIComponent,
		Fragment,
		UploadCollection,
		UploadCollectionItem,
		UploadCollectionParameter,
		ObjectAttribute,
		JSONModel,
		Filter,
		FilterOperator,
		MessageBox,
		Button,
		Log,
		FileSizeFormat
	) {
		"use strict";

		/**
		 * Constructor for the Attachment Manager Reusable Component.
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 *
		 * The AttachmentManager reusable component is used to have a generic way of working with attachments across different applications.
		 * This Component has his own dedicated OData-service (<code>/sap/opu/odata/sap/ZATTACHMENT_MANAGER_SRV</code>) in which the
		 * back-end logic can be defined per application using function modules in SAP.
		 *
		 * <h3>Usage</h3>
		 *
		 * The calling application can provide the properties of the AttachmentManager component, there are 3 properties that need to be provided
		 * by the calling application:
		 * <ol>
		 * 	<li>objectType: This property defines the object type of the root ID of the calling application. For example: BUS2038 for Notifications</li>
		 *  <li>applicationId: This property defines the application ID of the calling application, for this we use the BSP-name of the Fiori application in the SAP Front-End Server. For example: ZUI5_SPR_CHANGE for the My Changes application</li>
		 *  <li>objectId: This property is the root ID in the calling application, this is needed when we need to link the attachments to the correct root object. In case of create mode, the application can generate an id and pass this temporary one in.</li>
		 * </ol>
		 *
		 * Only once these <strong>three properties</strong> are provided the content in the the root control will be bound. As these are the keys for the OData entitySet.
		 *
		 * An additional <strong>important</strong> property is the <strong>isLegacy</strong>-property. This boolean is used to determine which of the controls should be instantiated,
		 * in case of isLegacy=true we instantiate a <code>sap.m.UploadCollection</code> which is the current default!!!
		 * Otherwise we will instantiate a <code>sap.m.upload.UploadSet</code>, which will be available as of UI5 version 1.62.
		 *
		 * <strong>The isLegacy property should always be set to true for now!</strong>
		 *
		 * All other properties can be provided.
		 *
		 * @name    	rpan.lib.attachmentManager
		 * @alias   	rpan.lib.attachmentManager
		 * @author  	Robin Panneels
		 * @license 	MIT
		 * @extends 	sap.ui.core.UIComponent
		 * @constructor
		 * @public
		 */
		const AttachmentManager = UIComponent.extend(
			"rpan.lib.attachmentManager.Component",
			/** @lends  rpan.lib.attachmentManager.Component.prototype **/ {
				metadata: {
					manifest: "json",
					properties: {
						// Properties for the creation of the attachments via the SLUG header parameter

						/**
						 * The ID of the root entity (used to link the attachment)
						 * @since 1.0.0
						 */
						objectId: {
							type: "string",
							defaultValue: ""
						},

						/**
						 * The ID of the calling application. We use the BSP-name of the application for this.
						 * @since 1.0.0
						 */
						applicationId: {
							type: "string",
							defaultValue: ""
						},

						/**
						 * The BUS-type (or something else defined) of the root entity (used to link the attachment)
						 * @since 1.0.0
						 */
						objectType: {
							type: "string",
							defaultValue: ""
						},

						// Properties for the Component itself

						/**
						 * Triggers the creation of the correct root control:
						 * When true use <code>sap.m.UploadCollection</code>
						 * When false use <code>sap.m.upload.UploadSet</code>
						 * @since 1.0.0
						 */
						isLegacy: {
							type: "boolean",
							defaultValue: true
						},

						// For sap.m.UploadCollection
						/**
						 * Instant upload yes or no?
						 * @since 1.0.0
						 */
						instantUpload: {
							type: "boolean",
							defaultValue: false
						},

						/**
						 * Maximum allowed length of the file name
						 * @since 1.0.0
						 */
						maximumFileNameLength: {
							type: "int",
							group: "Data",
							defaultValue: 55
						},

						/**
						 * Maximum allowed size of the file
						 * @since 1.0.0
						 */
						maximumFileSize: { type: "float", group: "Data", defaultValue: 10 },

						/**
						 * Text to display in the control when no data is available
						 * @since 1.0.0
						 */
						noDataText: {
							type: "string",
							group: "Appearance",
							defaultValue: null
						},

						/**
						 * Description to display in the control when no data is available
						 * @since 1.0.0
						 */
						noDataDescription: {
							type: "string",
							group: "Appearance",
							defaultValue: null
						},

						/**
						 * Can the same file name be used more than once?
						 * @since 1.0.0
						 */
						allowSameFileName: {
							type: "boolean",
							group: "Behavior",
							defaultValue: false
						},

						/**
						 * Can multiple files be uploaded at once?
						 * @since 1.0.0
						 */
						multiple: {
							type: "boolean",
							group: "Behavior",
							defaultValue: true
						},

						/**
						 * What is the mode for the list
						 * @since 1.0.0
						 */
						listMode: {
							type: "sap.m.ListMode",
							group: "Behavior",
							defaultValue: "None"
						},

						/**
						 * What are the allowed file types for upload?
						 * @since 1.0.0
						 */
						allowedFileTypes: {
							type: "string[]",
							group: "Data",
							defaultValue: ["png", "jpg", "pdf"]
						},

						/**
						 * What are the allowed mime types for upload?
						 * @since 1.0.0
						 */
						allowedMimeTypes: {
							type: "string[]",
							group: "Data",
							defaultValue: null
						},

						/**
						 * Is the upload functionality enabled?
						 * @since 1.0.0
						 */
						enableUpload: {
							type: "boolean",
							group: "Behavior",
							defaultValue: true
						},

						/**
						 * Is the edit functionality enabled?
						 * @since 1.0.0
						 */
						enableEdit: {
							type: "boolean",
							group: "Behavior",
							defaultValue: true
						},

						/**
						 * Is the delete functionality enabled?
						 * @since 1.0.0
						 */
						enableDelete: {
							type: "boolean",
							group: "Behavior",
							defaultValue: true
						},

						/**
						 * Is the terminate upload functionality enabled?
						 * @since 1.0.0
						 */
						enableTerminateUpload: {
							type: "boolean",
							group: "Behavior",
							defaultValue: true
						},

						/**
						 * Is the link upload enabled?
						 * @since 1.0.0
						 */
						enableUrlUpload: {
							type: "boolean",
							group: "Behavior",
							defaultValue: false
						},

						/**
						 * Display the upload button?
						 * @since 1.0.0
						 */
						showUploadButton: {
							type: "boolean",
							group: "Appearance",
							defaultValue: true
						},

						/**
						 * Display the edit button?
						 * @since 1.0.0
						 */
						showEditButton: {
							type: "boolean",
							group: "Appearance",
							defaultValue: true
						},

						/**
						 * Display the delete button?
						 * @since 1.0.0
						 */
						showDeleteButton: {
							type: "boolean",
							group: "Appearance",
							defaultValue: true
						},

						/**
						 * Display the url upload button?
						 * @since 1.0.0
						 */
						showUrlUploadButton: {
							type: "boolean",
							group: "Appearance",
							defaultValue: false
						},

						/**
						 * Type of separators
						 * @since 1.0.0
						 */
						showSeparators: {
							type: "sap.m.ListSeparators",
							group: "Appearance",
							defaultValue: "All"
						}
					},
					aggregations: {},
					events: {
						/**
						 * Called when the number of attachments are changes/bound
						 * @since 1.0.0
						 */
						numberOfAttachmentsChange: {
							parameters: {
								/**
								 * Actual number of items.
								 */
								actual: { type: "int" }
							}
						},
						/**
						 * Raised when the files are uploaded when 'instantUpload' = true
						 * @since 1.0.0
						 */
						filesUploaded: {
							parameters: {
								/**
								 * Uploaded files
								 */
								files: { type: "object[]" }
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
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @public
		 * @override
		 */
		AttachmentManager.prototype.init = function() {
			this._readComponentData(this.getComponentData());
			this._resourceBundle = this.getModel("i18n").getResourceBundle();

			this._linkRequestId = 0;
			this._pendingUploadLinks = [];

			// Local json model for the link dialog
			this.setModel(
				new JSONModel({
					link: null,
					description: null
				}),
				"attachmentManagerLink"
			);
			UIComponent.prototype.init.apply(this, arguments);
		};

		/**
		 * Creates the root control representing the Component.
		 *
		 * @method		createContent
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{sap.m.UploadCollection|sap.m.upload.UploadSet}				The entry point of the component
		 * @public
		 * @override
		 */
		AttachmentManager.prototype.createContent = function() {
			return this._createRootControl(this.getIsLegacy());
		};

		/**
		 * Called when the component is destroyed
		 *
		 * @method		destroy
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @public
		 * @override
		 */
		AttachmentManager.prototype.destroy = function() {
			if (this._addLinkDialog) {
				this._addLinkDialog.destroy();
			}
			UIComponent.prototype.destroy.apply(this, arguments);
		};

		//=============================================================================
		// OVERRIDE SETTERS
		//=============================================================================

		/**
		 * Overload of standard property setter, so we can check if we have the necessary parameters to collect the history log
		 *
		 * @method  		setProperty
		 * @memberof    rpan.lib.attachmentManager.Component
		 * @param 			{string} 						name 					The name of the property you are setting
		 * @param 			{any} 							value 				The value for the property you are setting
		 * @public
		 **/
		AttachmentManager.prototype.setProperty = function(name, value) {
			UIComponent.prototype.setProperty.apply(this, arguments); //make sure you execute the original property setter

			if (
				name === "applicationId" ||
				name === "objectType" ||
				name === "objectId"
			) {
				// Check if we have the 3 mandatory properties
				if (
					this.getProperty("applicationId") &&
					this.getProperty("objectType") &&
					this.getProperty("objectId")
				) {
					this._setBindingForRootControl({
						applicationId: this.getProperty("applicationId"),
						objectType: this.getProperty("objectType"),
						objectId: this.getProperty("objectId")
					});
				}
			}
		};

		//=============================================================================
		// PUBLIC APIS
		//=============================================================================

		/**
		 * Public function which can be called from the calling application, which will be used to upload/delete attachments and links
		 * for the application. This function will return a promise which will be resolved when everything went ok and will be rejected
		 * when an error occurred.
		 *
		 * This function will only be called when the <code>instantUpload</code> property is set to false.
		 *
		 * @method		upload
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{string}					objectId					Root Id which need to be linked to the to be uploaded/deleted attachments/links
		 * @returns		{promise}					Promise which is resolved/rejected when the upload/delete is done
		 * @public
		 */
		AttachmentManager.prototype.upload = function(objectId) {
			return new Promise(
				function(resolve, reject) {
					this._realObjectId = objectId ? objectId : this.getObjectId();
					if (!this._realObjectId) {
						reject("No objectId!");
					}

					const rootControl = this.getRootControl();

					// Disable the refresh after change for the upload
					this.getModel("attachmentManager").setRefreshAfterChange(false);

					// Get all upload/delete promises in 1 promise array
					const promises = this._getPromisesForUpload();

					this._filesUploaded = 0;

					if (rootControl.getPendingUploadItems().length > 0) {
						rootControl.upload(); // Only triggers the "UPLOAD of attachments"
					} else {
						// Just resolve the promise
						setTimeout(
							function() {
								this._uploadPromise.resolve(this._realObjectId);
							}.bind(this),
							50
						);
					}

					// Trigger delete and upload of the files
					Promise.all(promises)
						.then(
							function(results) {
								this.getModel("attachmentManager").setRefreshAfterChange(true);
								this.getRootControl().unbindItems();
								this.getRootControl().destroyItems();

								// Clear the arrays for upload and deletion of links
								this._pendingUploadLinks = [];

								this.getRootControl().clearAfterUpload();

								// Change to recursive function?
								setTimeout(
									function() {
										this._setBindingForRootControl({
											applicationId: this.getProperty("applicationId"),
											objectType: this.getProperty("objectType"),
											objectId: this._realObjectId
										});
									}.bind(this),
									1000
								);
								resolve();
							}.bind(this)
						)
						.catch(function(errors) {
							reject("Error");
						});
				}.bind(this)
			);
		};

		/**
		 * Public function which checks if the attachmentManager still has pending changes for the OData-service.
		 *
		 * @method		hasPendingChanges
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{boolean}					True when there are pending changes, false otherwise
		 * @public
		 */
		AttachmentManager.prototype.hasPendingChanges = function() {
			if (this.getIsLegacy()) return this._hasPendingChangesLegacy();
			else return this._hasPendingChanges();
		};

		/**
		 * Returns the array with the current links that are pending for upload.
		 *
		 * @method		getPendingUploadLinks
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{array}					Array with pending upload links
		 * @public
		 */
		AttachmentManager.prototype.getPendingUploadLinks = function() {
			return this._pendingUploadLinks;
		};

		//=============================================================================
		// EVENT HANDLERS
		//=============================================================================

		/**
		 * <strong>Beware: </strong> this event is only called/raised when the isLegacy-property is set to true!
		 *
		 * Event handler for when the attachment changes, at this point we need to trigger the x-csrf-token on
		 * the SAP Gateway. This way we are sure that the upload won't be blocked because of an invalid
		 * security token. We need to add the new token in the headers of the call.
		 *
		 * @method		onAttachmentChange
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The attachmentChange event
		 * @public
		 */
		AttachmentManager.prototype.onAttachmentChange = function(event) {
			const uploader = event.getSource(),
				model = this.getModel("attachmentManager");

			// Clear All Header parameters for the UploadCollection
			uploader.removeAllHeaderParameters();
			// Refresh security token (X-CSRF-Token)
			model.refreshSecurityToken();
			const headers = model.oHeaders,
				token = headers["x-csrf-token"],
				customerHeaderToken = new UploadCollectionParameter({
					name: "x-csrf-token",
					value: token
				});
			uploader.addHeaderParameter(customerHeaderToken);
		};

		/**
		 * EventHandler for the beforeUploadStarts-event, at this point additional header parameters are added
		 * in order to provide information to the backend. These parameters are:
		 * <li>
		 * 	<ul>The "slug": Contains the information for the linking of the attachment to the correct </ul>
		 * 	<ul>The content-type: when the browser isn't IE or edge the content-type of the attachment needs to be added</ul>
		 * </li>
		 *
		 * @method		onBeforeUploadStarts
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The beforeUploadStarts-event
		 * @public
		 */
		AttachmentManager.prototype.onBeforeUploadStarts = function(event) {
			const fileName = event.getParameter("fileName");

			// Create header parameter for the upload --> file identification (SLUG)
			event.getParameters().addHeaderParameter(
				new UploadCollectionParameter({
					name: "slug",
					value: this._createSlugHeader(fileName)
				})
			);
		};

		/**
		 * Event handler for when the upload of a specific file is completed. At this point we need to check
		 * if all the files are uploaded, if this is the case the upload-promise is resolved.
		 *
		 * @method		onUploadComplete
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The uploadComplete-event
		 * @public
		 */
		AttachmentManager.prototype.onUploadComplete = function(event) {
			if (this.getIsLegacy()) {
				this._onLegacyUploadComplete(event);
			} else {
				this._onUploadComplete(event);
			}
		};

		/**
		 * Event handler for when a specific file is deleted. Depending on the <strong>isLegacy</strong>-property
		 * we need call the correct function, based on this boolean the implementation might vary.
		 *
		 * @method		onAttachmentDeleted
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The fileDeleted-event
		 * @public
		 */
		AttachmentManager.prototype.onAttachmentDeleted = function(event) {
			if (this.getIsLegacy()) {
				this._onLegacyAttachmentDeleted(event);
			} else {
				this._onAttachmentDeleted(event);
			}
		};

		/**
		 * Event handler for when the file name or the file description is changed. Depending on the <strong>isLegacy</strong>-property
		 * we need call the correct function, based on this boolean the implementation might vary.
		 *
		 * @method		onFileRenamed
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The fileRenamed-event
		 * @public
		 */
		AttachmentManager.prototype.onFileRenamed = function(event) {
			if (this.getIsLegacy()) {
				this._onLegacyAttachmentEdited(event);
			} else {
				this._onAttachmentEdited(event);
			}
		};

		/**
		 * Event handler for when the file size of the attachment that is trying to be uploaded is too big.
		 * This will stop the upload and inform the user about this issue.
		 *
		 * @method		onFileSizeExceeded
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The fileSizeExceeded-event
		 * @public
		 */
		AttachmentManager.prototype.onFileSizeExceeded = function(event) {
			this._showFileSizeErrorForFiles(event.getParameter("files"));
		};

		/**
		 * Event handler for when the file size of the attachment that is trying to be uploaded is too big.
		 * This will stop the upload and inform the user about this issue.
		 *
		 * @method		onFileSizeExceeded
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The filenameLengthExceed-event
		 * @public
		 */
		AttachmentManager.prototype.onFileNameLengthExceeded = function(event) {
			this._showFileNameLengthErrorForFiles(event.getParameter("files"));
		};

		/**
		 * Event handler for when the file type and the mime type aren't ok.
		 * This will stop the upload and inform the user about this issue.
		 *
		 * @method		onTypeMissMatch
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The typeMissmatch-event
		 * @public
		 */
		AttachmentManager.prototype.onTypeMissMatch = function(event) {
			this._showFileTypeMissmatchErrorForFiles(event.getParameter("files"));
		};

		/**
		 * Event handler for when the user cancels the upload of an attachment by clicking on the control.
		 * This will stop the upload and inform the user about this issue.
		 *
		 * @method		onUploadTerminated
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The uploadTerminated-event
		 * @public
		 */
		AttachmentManager.prototype.onUploadTerminated = function(event) {
			// TODO
		};

		/**
		 * Event handler for when the user clicks on the upload url button. This will open the dialog in which the
		 * information of the link can be added by the user.
		 *
		 * @method		onUploadUrl
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The press-event
		 * @public
		 */
		AttachmentManager.prototype.onUploadUrl = function(event) {
			this._openLinkDialog();
		};

		/**
		 * Event handler for when the user has entered the data for the to be uploaded link and he presses on the ok-button.
		 * Depending on the <strong>isLegacy</strong>-property the implementation will vary.
		 *
		 * @method		onLinkAddPress
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The press-event
		 * @public
		 */
		AttachmentManager.prototype.onLinkAddPress = function(event) {
			if (this.getIsLegacy()) this._addLinkLegacy();
			else this._addLink();
		};

		/**
		 * Event handler for when the user has cancels the add-functionality of the links.
		 * The Dialog will be closed and data will be cleared.
		 *
		 * @method		onLinkCancelPress
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The press-event
		 * @public
		 */
		AttachmentManager.prototype.onLinkCancelPress = function(event) {
			this._cancelLinkCreation();
		};

		/**
		 * Event handler for when number of attachments in the rootControl are changed.
		 * This event is raised in the control and we forward it to the calling application, this way
		 * the calling application can show the number of attachments in an <code>IconTabBar</code> for example.
		 *
		 * @method		onLinkCancelPress
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event				The numberOfAttachmentsChange-event
		 * @public
		 */
		AttachmentManager.prototype.onNumberOfAttachmentsChange = function(event) {
			this.fireNumberOfAttachmentsChange({
				actual: event.getParameter("actual")
			});
		};

		//=============================================================================
		// PRIVATE APIS
		//=============================================================================

		/**
		 * Reads out the passed in component data and calls the necessary setters for each of them.
		 *
		 * @method		_readComponentData
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{map}					componentData				The passed in component data
		 * @private
		 */
		AttachmentManager.prototype._readComponentData = function(componentData) {
			if (typeof componentData.applicationId === "string")
				this.setApplicationId(componentData.applicationId);
			if (typeof componentData.objectId === "string")
				this.setObjectId(componentData.objectId);
			if (typeof componentData.objectType === "string")
				this.setObjectType(componentData.objectType);
			if (typeof componentData.level === "string")
				this.setLevel(componentData.level);
			if (typeof componentData.isLegacy === "boolean")
				this.setIsLegacy(componentData.isLegacy);
			if (typeof componentData.instantUpload === "boolean")
				this.setInstantUpload(componentData.instantUpload);
			if (typeof componentData.maximumFileNameLength === "number")
				this.setMaximumFileNameLength(componentData.maximumFileNameLength);
			if (typeof componentData.maximumFileSize === "number")
				this.setMaximumFileSize(componentData.maximumFileSize);
			if (typeof componentData.noDataText === "string")
				this.setNoDataText(componentData.noDataText);
			if (typeof componentData.noDataDescription === "string")
				this.setNoDataDescription(componentData.noDataDescription);
			if (typeof componentData.allowSameFileName === "boolean")
				this.setAllowSameFileName(componentData.allowSameFileName);
			if (typeof componentData.multiple === "boolean")
				this.setMultiple(componentData.multiple);
			if (typeof componentData.listMode === "string")
				this.setListMode(componentData.listMode);
			if (typeof componentData.allowedFileTypes === "object")
				this.setAllowedFileTypes(componentData.allowedFileTypes);
			if (typeof componentData.allowedMimeTypes === "object")
				this.setAllowedMimeTypes(componentData.allowedMimeTypes);
			if (typeof componentData.enableUpload === "boolean")
				this.setEnableUpload(componentData.enableUpload);
			if (typeof componentData.enableEdit === "boolean")
				this.setEnableEdit(componentData.enableEdit);
			if (typeof componentData.enableDelete === "boolean")
				this.setEnableDelete(componentData.enableDelete);
			if (typeof componentData.enableTerminateUpload === "boolean")
				this.setEnableTerminateUpload(componentData.enableTerminateUpload);
			if (typeof componentData.showUploadButton === "boolean")
				this.setShowUploadButton(componentData.showUploadButton);
			if (typeof componentData.showEditButton === "boolean")
				this.setShowEditButton(componentData.showEditButton);
			if (typeof componentData.showDeleteButton === "boolean")
				this.setShowDeleteButton(componentData.showDeleteButton);
			if (typeof componentData.showSeparators === "string")
				this.setShowSeparators(componentData.showSeparators);
			if (typeof componentData.showUrlUploadButton === "boolean")
				this.setShowUrlUploadButton(componentData.showUrlUploadButton);
			if (typeof componentData.enableUrlUpload === "boolean")
				this.setEnableUrlUpload(componentData.enableUrlUpload);
		};

		/**
		 * Create the root control for the Component.
		 * In case of isLegacy=true this will be a <code>sap.m.UploadCollection</code> otherwise this will be a
		 * <code>sap.m.upload.UploadSet</code>.
		 *
		 * @method		_createRootControl
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{boolean}					isLegacy				isLegacy yes or no
		 * @returns		{sap.m.UploadCollection|sap.m.upload.UploadSet}			The root control
		 * @private
		 */
		AttachmentManager.prototype._createRootControl = function(isLegacy) {
			const rootControl = isLegacy
				? this._createUploadCollection()
				: this._createUploadSet();

			return rootControl;
		};

		/**
		 * Creates the an <code>sap.m.UploadCollection</code> using the properties defined in this Component.
		 *
		 * @method		_createUploadCollection
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{sap.m.UploadCollection}			The root control
		 * @private
		 */
		AttachmentManager.prototype._createUploadCollection = function() {
			const uploadCollection = new UploadCollection(
				this.createId("attachmentManager"),
				{
					uploadUrl:
						"/sap/opu/odata/sap/ZATTACHMENT_MANAGER_SRV/AttachmentSet",
					fileType: this.getAllowedFileTypes(),
					instantUpload: this.getInstantUpload(),
					maximumFileSize: this.getMaximumFileSize(),
					maximumFilenameLength: this.getMaximumFileNameLength(),
					mimeType: this.getAllowedMimeTypes(),
					mode: this.getListMode(),
					multiple: this.getMultiple(),
					noDataDescription: this.getNoDataDescription(),
					noDataText: this.getNoDataText(),
					sameFilenameAllowed: this.getAllowSameFileName(),
					showSeparators: this.getShowSeparators(),
					terminationEnabled: this.getEnableTerminateUpload(),
					uploadButtonInvisible: !this.getShowUploadButton(),
					uploadEnabled: this.getEnableUpload(),
					// Events
					change: this.onAttachmentChange.bind(this),
					fileDeleted: this.onAttachmentDeleted.bind(this),
					uploadComplete: this.onUploadComplete.bind(this),
					beforeUploadStarts: this.onBeforeUploadStarts.bind(this),
					fileSizeExceed: this.onFileSizeExceeded.bind(this),
					filenameLengthExceed: this.onFileNameLengthExceeded.bind(this),
					typeMissmatch: this.onTypeMissMatch.bind(this),
					uploadTerminated: this.onUploadTerminated.bind(this),
					fileRenamed: this.onFileRenamed.bind(this),
					// Custom Event
					numberOfAttachmentsChange: this.onNumberOfAttachmentsChange.bind(this)
				}
			);

			uploadCollection.addEventDelegate(
				{
					onAfterRendering: this._addUrlUploadButton
				},
				this
			);

			return uploadCollection;
		};

		/**
		 * Creates the an <code>sap.m.upload.UploadSet</code> using the properties defined in this Component.
		 *
		 * @method		_createUploadSet
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{sap.m.upload.UploadSet}			The root control
		 * @private
		 */
		AttachmentManager.prototype._createUploadSet = function() {
			// TODO
			return null;
		};

		/**
		 * Returns the new UploadCollectionItem-template for the <code>sap.m.UploadCollection</code> based on the given
		 * properties.
		 *
		 * @method		_getUploadCollectionTemplate
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{sap.m.UploadCollectionItem}			The UploadCollectionItem template for the items in the UploadCollection
		 * @private
		 */
		AttachmentManager.prototype._getUploadCollectionTemplate = function() {
			return new UploadCollectionItem({
				documentId: "{attachmentManager>AttachmentId}",
				fileName:
					"{= !${attachmentManager>IsUrl} ? ${attachmentManager>FileName} : ${attachmentManager>Description} }",
				mimeType: "{attachmentManager>MimeType}",
				url:
					"{= ${attachmentManager>IsUrl} ? ${attachmentManager>FileName} : ${attachmentManager>__metadata/media_src} }",
				enableEdit: this.getEnableEdit(),
				enableDelete: this.getEnableDelete(),
				visibleEdit: this.getShowEditButton(),
				visibleDelete: this.getShowDeleteButton(),
				thumbnailUrl:
					"{= ${attachmentManager>IsUrl} ? 'sap-icon://chain-link' : ''}",
				attributes: [
					new ObjectAttribute({
						title: this._resourceBundle.getText("attachment.item.uploadedBy"),
						text: "{attachmentManager>CreationUser}"
					}),
					new ObjectAttribute({
						title: this._resourceBundle.getText("attachment.item.uploadedOn"),
						text: {
							path: "attachmentManager>CreationDate",
							type: "sap.ui.model.type.DateTime",
							formatOptions: {
								pattern: "dd/MM/yyyy HH:mm:ss"
							}
						}
					}),
					new ObjectAttribute({
						title: this._resourceBundle.getText("attachment.item.fileSize"),
						text: {
							path: "attachmentManager>FileSize",
							formatter: this._formatFileSize
						},
						visible: "{= !${attachmentManager>IsUrl}}"
					})
				]
			});
		};

		/**
		 * Creates a combined filter for the incoming parameters.
		 *
		 * @method		_createFilters
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{Map}				parameters									Map with parameters
		 * @param			{string}		parameters.applicationId		Application id (of the calling application)
		 * @param			{string}		parameters.objectType				Object Type (used for back-end and linking to correct implementation)
		 * @param			{string}		parameters.objectId					The key/Id of the calling application (on which document is the attachment stored?)
		 * @returns		{sap.ui.model.Filter}										The combined filter (with and)
		 * @private
		 */
		AttachmentManager.prototype._createFilters = function(parameters) {
			const { applicationId, objectType, objectId } = parameters;
			return new Filter({
				filters: [
					new Filter({
						path: "ApplicationId",
						operator: FilterOperator.EQ,
						value1: applicationId
					}),
					new Filter({
						path: "ObjectId",
						operator: FilterOperator.EQ,
						value1: objectId
					}),
					new Filter({
						path: "ObjectType",
						operator: FilterOperator.EQ,
						value1: objectType
					})
				],
				and: true
			});
		};

		/**
		 * Makes sure that we display the correct data in the rootControl. When the obligatory parameters are filled in.
		 * When we don't yet have a binding in the rootControl (either <code>sap.m.UploadCollection</code> or <code>sap.m.upload.UploadSet</code>)
		 * we create this binding, otherwise we filter on the existing binding. This way we don't need to destroy and create the attachmentManager component
		 * over and over in the calling application.
		 *
		 * @method		_setBindingForRootControl
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{Map}				parameters									Map with parameters
		 * @param			{string}		parameters.applicationId		Application id (of the calling application)
		 * @param			{string}		parameters.objectType				Object Type (used for back-end and linking to correct implementation)
		 * @param			{string}		parameters.objectId					The key/Id of the calling application (on which document is the attachment stored?)
		 * @private
		 */
		AttachmentManager.prototype._setBindingForRootControl = function(
			parameters
		) {
			const rootControl = this.getRootControl();
			if (!rootControl) throw "No root control";

			// Check if we already have an items-binding for the UploadCollection
			if (rootControl.getBinding("items")) {
				// When we already have an items-binding we just need to filter the list with the new values
				rootControl
					.getBinding("items")
					.filter(this._createFilters(parameters), "Application");

				this._informWhenBindingIsDone(rootControl, "items")
					.then(
						function() {
							// Inform calling application
							this.fireNumberOfAttachmentsChange({
								actual: rootControl.getItems().length
							});
						}.bind(this)
					)
					.catch(
						function(error) {
							Log.error("Binding is not refreshed!");
						}.bind(this)
					);
				return;
			}

			// Create the items-binding based on the required filters
			rootControl.bindItems({
				path: "attachmentManager>/AttachmentSet",
				filters: this._createFilters(parameters),
				templateShareable: true,
				template: this._getUploadCollectionTemplate()
			});
			this._informWhenBindingIsDone(rootControl, "items")
				.then(
					function() {
						// Inform calling application
						this.fireNumberOfAttachmentsChange({
							actual: rootControl.getItems().length
						});
					}.bind(this)
				)
				.catch(
					function(error) {
						Log.error("Binding is not refreshed!");
					}.bind(this)
				);
		};

		/**
		 * Checks if the binding for the given aggregation on the given control is finished. We check each 100ms and after 100 retries we stop checking.
		 * This means that the binding failed (shouldn't happen). We resolve the promise when the binding-request is done.
		 *
		 * @method		_setBindingForRootControl
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.control}				control									Control on which we will check the binding for the given aggregation
		 * @param			{string}								aggregation							Aggregation name that needs to be checked
		 * @returns		{Promise}								Promise which is resolved when the aggregation binding is refreshed, rejected otherwise (after 100 retries)
		 * @private
		 */
		AttachmentManager.prototype._informWhenBindingIsDone = function(
			control,
			aggregation
		) {
			return new Promise(function(resolve, reject) {
				let intervalId,
					counter = 0;
				const checkBinding = () => {
					if (counter > 100) {
						reject("Waiting for too long");
						clearInterval(intervalId);
					} else if (!control.getBinding(aggregation).bPendingRequest) {
						resolve();
						clearInterval(intervalId);
					} else {
						counter++;
					}
				};

				intervalId = setInterval(checkBinding, 100);
			});
		};

		/**
		 * In order to upload a new attachment on the back-end we need to provide a slug-header for this attachment. This slug header contains all the
		 * key information which is needed to link the specific attachment to the business object on the back-end. So that the document is stored in the
		 * correct way.
		 *
		 * We need to provide following information in the slug header separated by slashes:
		 * <ol>
		 * 	<li>Application ID</li>
		 *  <li>Object ID</li>
		 *  <li>Object ID</li>
		 *  <li>File name</li>
		 * </ol>
		 *
		 *
		 * @method		_createSlugHeader
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{string}								fileName							Filename for which a slug needs to be created
		 * @returns		{String}								Complete slug header
		 * @private
		 */
		AttachmentManager.prototype._createSlugHeader = function(fileName) {
			if (this.getInstantUpload()) {
				return (
					this.getApplicationId() +
					"/" +
					this.getObjectType() +
					"/" +
					this.getObjectId() +
					"/" +
					fileName
				);
			}

			return (
				this.getApplicationId() +
				"/" +
				this.getObjectType() +
				"/" +
				this._realObjectId + // In case of creation mode we need to replace the generated uid by the real object id
				"/" +
				fileName
			);
		};

		/**
		 * Show a MessageBox for the files with a file size error.
		 *
		 * @method		_showFileSizeErrorForFiles
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{array}									files									Files with issues
		 * @private
		 */
		AttachmentManager.prototype._showFileSizeErrorForFiles = function(files) {
			const message = files
				.map(file => {
					return file.name + "(" + file.fileSize + ")";
				})
				.join(", ");
			MessageBox.error(
				this._resourceBundle.getText("error.msg.fileSize.exceeds", [message]),
				{ title: this._resourceBundle.getText("error.tit.fileSize.exceeds") }
			);
		};

		/**
		 * Show a MessageBox for the files with a file name length error.
		 *
		 * @method		_showFileNameLengthErrorForFiles
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{array}									files									Files with issues
		 * @private
		 */
		AttachmentManager.prototype._showFileNameLengthErrorForFiles = function(
			files
		) {
			const message = files
				.map(file => {
					return file.name + "(" + file.name.length + ")";
				})
				.join(", ");
			MessageBox.error(
				this._resourceBundle.getText("error.msg.fileNameLength.exceeds", [
					message
				]),
				{
					title: this._resourceBundle.getText(
						"error.tit.fileNameLength.exceeds"
					)
				}
			);
		};

		/**
		 * Show a MessageBox for the files with file type erros.
		 *
		 * @method		_showFileTypeMissmatchErrorForFiles
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{array}									files									Files with issues
		 * @private
		 */
		AttachmentManager.prototype._showFileTypeMissmatchErrorForFiles = function(
			files
		) {
			const message = files
				.map(file => {
					return file.name + "(" + file.fileType + ")";
				})
				.join(", ");
			MessageBox.error(
				this._resourceBundle.getText("error.msg.fileType.missmatch", [message]),
				{
					title: this._resourceBundle.getText("error.tit.fileType.missmatch")
				}
			);
		};

		/**
		 * Creates the OData delete calls for the attachments that need to be deleted.
		 * We map these calls in promises and return them in an array.
		 *
		 * @method		_createDeleteAttachmentCalls
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{array}									files									Files that need to be deleted
		 * @returns		{array}									Array with promises for the delete attachment calls
		 * @private
		 */
		AttachmentManager.prototype._createDeleteAttachmentCalls = function(files) {
			const model = this.getModel("attachmentManager");
			return files.map(file => {
				return new Promise((resolve, reject) => {
					const path = file.getBindingContext("attachmentManager").getPath();
					model.remove(path, {
						success: () => resolve(path),
						error: error => reject(error)
					});
				});
			});
		};

		/**
		 * Creates the upload (POST) calls for the LinkSet (entitySet). This in order to be able to
		 * create a new link entry in the back-end.
		 *
		 * @method		_createUploadLinkCalls
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{array}									links								Links that need to be uploaded
		 * @returns		{array}									Array with promises for the create link calls
		 * @private
		 */
		AttachmentManager.prototype._createUploadLinkCalls = function(links) {
			const model = this.getModel("attachmentManager");
			return links.map(link => {
				return new Promise((resolve, reject) => {
					model.create("/LinkSet", link.link, {
						success: resolve,
						error: reject,
						refreshAfterChange: false
					});
				});
			});
		};

		/**
		 * Creates the OData delete calls for the links that need to be deleted.
		 * We map these calls in promises and return them in an array.
		 *
		 * @method		_createDeleteLinkCalls
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{array}									links										Links that need to be deleted
		 * @returns		{array}									Array with promises for the delete link calls
		 * @private
		 */
		AttachmentManager.prototype._createDeleteLinkCalls = function(links) {
			const model = this.getModel("attachmentManager");
			return links.map(link => {
				return new Promise((resolve, reject) => {
					const path = model.createKey(
						"LinkSet",
						link.getBindingContext("attachmentManager").getObject()
					);
					model.remove("/" + path, {
						success: resolve,
						error: reject,
						refreshAfterChange: false
					});
				});
			});
		};

		/**
		 * Creates a promise for the upload of the attachments, we will resolve this ourself when all the attachments
		 * are uploaded (see onUploadComplete).
		 *
		 * @method		_createUploadAttachmentsCalls
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{array}									Array with the one upload promise
		 * @private
		 */
		AttachmentManager.prototype._createUploadAttachmentsCalls = function() {
			const defer = () => {
				let res, rej;
				const promise = new Promise(
					function(resolve, reject) {
						res = resolve;
						rej = reject;
					}.bind(this)
				);
				promise.resolve = res;
				promise.reject = rej;
				return promise;
			};

			// Keep the upload promise accessible throughout the component
			this._uploadPromise = defer();
			// Return it in an array
			return [this._uploadPromise];
		};

		/**
		 * Checks if there are pending changes (upload/delete calls).
		 *
		 * @method		_hasPendingChangesLegacy
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{boolean}									True when pending changes, false otherwise
		 * @private
		 */
		AttachmentManager.prototype._hasPendingChangesLegacy = function() {
			if (this.getEnableUrlUpload()) {
				return (
					this.getRootControl().getPendingDeleteItems().length > 0 ||
					this.getRootControl().getPendingUploadItems().length > 0 ||
					this.getPendingUploadLinks().length > 0
				);
			} else {
				return (
					this.getRootControl().getPendingDeleteItems().length > 0 ||
					this.getRootControl().getPendingUploadItems().length > 0
				);
			}
		};

		/**
		 * Checks if there are pending changes (upload/delete calls).
		 *
		 * @method		_hasPendingChanges
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{boolean}									True when pending changes, false otherwise
		 * @private
		 */
		AttachmentManager.prototype._hasPendingChanges = function() {
			// TODO implement once UploadSet is implemented
			return true;
		};

		/**
		 * Handles the upload in case the legacy flag is on.
		 *
		 * @method		_onLegacyUploadComplete
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event 			uploadComplete event
		 * @private
		 */
		AttachmentManager.prototype._onLegacyUploadComplete = function(event) {
			// In case of instant upload just refresh the model in order to have the correct data in the root control.
			// Also Fire the filesUploaded-event so that the calling application is informed.
			if (this.getInstantUpload()) {
				this.getModel("attachmentManager").refresh();
				// Upload done and instant upload --> Inform the calling application
				this.fireFilesUploaded({
					files: event.getParameter("files")
				});
			} else {
				// No instant upload, so we need to check if all files are upload in order to resolve the upload promise.
				this._filesUploaded = this._filesUploaded + 1;
				if (
					this.getRootControl().getPendingUploadItems().length ===
					this._filesUploaded
				) {
					this._uploadPromise.resolve(this._realObjectId);
				}
			}
		};

		/**
		 * Handles the upload in case the legacy flag is off.
		 *
		 * @method		_onUploadComplete
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event 			uploadComplete event
		 * @private
		 */
		AttachmentManager.prototype._onUploadComplete = function(event) {
			// TODO once UploadSet is implemented
		};

		/**
		 * Handles the delete event for the attachment in case the legacy flag is on.
		 *
		 * @method		_onLegacyAttachmentDeleted
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event 			fileDeleted-event
		 * @private
		 */
		AttachmentManager.prototype._onLegacyAttachmentDeleted = function(event) {
			const path = event
				.getParameter("item")
				.getBindingContext("attachmentManager")
				.getPath();
			if (!path) return;

			this.getModel("attachmentManager").remove(path, {
				success: function() {
					this.getModel("attachmentManager").refresh();
				}.bind(this),
				error: function(error) {
					Log.error("Could not delete attachment with path: " + path);
				}.bind(this)
			});
		};

		/**
		 * Handles the delete event for the attachment in case the legacy flag is off.
		 *
		 * @method		_onAttachmentDeleted
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event 			fileDeleted-event
		 * @private
		 */
		AttachmentManager.prototype._onAttachmentDeleted = function(event) {
			// TODO once UploadSet is implemented
		};

		/**
		 * Adds the url button on the root control's toolbar. On After rendering.
		 *
		 * @method		_addUrlUploadButton
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.Event}					event 			afterRendering-event
		 * @private
		 */
		AttachmentManager.prototype._addUrlUploadButton = function(event) {
			const rootControl = this.getRootControl();
			if (rootControl) {
				const toolbar = rootControl.getToolbar();
				if (
					toolbar.getContent().filter(
						function(item) {
							return item.getId() === this.createId() + "-uploadUrlButton";
						}.bind(this)
					).length === 0
				) {
					toolbar.insertContent(
						new Button(this.createId() + "-uploadUrlButton", {
							text: this._resourceBundle.getText("btn.upload.url"),
							enabled: this.getEnableUrlUpload(),
							visible: this.getShowUrlUploadButton(),
							press: this.onUploadUrl.bind(this)
						}),
						3 // FileUploader placeholder = 2, so we need to put it next to it.
					);
				}
			}
		};

		/**
		 * Formatter function for formatting the file size.
		 *
		 * @method		_formatFileSize
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{float}					fileSize 			Value for the file size
		 * @returns		{string}				Formatted file size
		 * @private
		 */
		AttachmentManager.prototype._formatFileSize = function(fileSize) {
			return FileSizeFormat.getInstance({
				binaryFilesize: false,
				maxFractionDigits: 1,
				maxIntegerDigits: 3
			}).format(fileSize);
		};

		/**
		 * Opens the dialog for adding a new link.
		 *
		 * @method		_openLinkDialog
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @private
		 */
		AttachmentManager.prototype._openLinkDialog = function() {
			if (this._addLinkDialog) {
				this._addLinkDialog.open();
				return;
			}

			Fragment.load({
				name:
					"rpan.lib.attachmentManager.fragment.CreateLinkDialog",
				controller: this
			}).then(
				function(dialog) {
					this._addLinkDialog = dialog;
					this.getRootControl().addDependent(this._addLinkDialog);
					this._addLinkDialog.open();
				}.bind(this)
			);
		};

		/**
		 * Cancels the link creation. Cleanup model for the dialog and close the dialog.
		 *
		 * @method		_cancelLinkCreation
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @private
		 */
		AttachmentManager.prototype._cancelLinkCreation = function() {
			this.getModel("attachmentManagerLink").setProperty("/link", null);
			this.getModel("attachmentManagerLink").setProperty("/description", null);
			this._addLinkDialog.close();
		};

		/**
		 * Adds the new link when legacy flag is on.
		 *
		 * @method		_addLinkLegacy
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @private
		 */
		AttachmentManager.prototype._addLinkLegacy = function() {
			if (this.getInstantUpload()) {
				// ! 0 - Get JSON model content
				const { link, description } = this.getModel(
					"attachmentManagerLink"
				).getProperty("/");
				// ! 1 - Create Object
				const newLink = {
					ApplicationId: this.getApplicationId(),
					ObjectId: this.getObjectId(),
					ObjectType: this.getObjectType(),
					FileName: link,
					Description: description,
					IsUrl: true
				};
				// ! 2 - Call creation promise
				this._createLinkAttachment(newLink)
					.then(
						function(data) {
							this.getModel("attachmentManager").refresh();
							this._addLinkDialog.close();
						}.bind(this)
					)
					.catch(
						function(error) {
							MessageBox.error("Error occurred!");
						}.bind(this)
					);
			} else {
				// Locally add the link (As an attachment)...
				this._createTemporaryLink(this._getNewLinkObject());
			}
		};

		/**
		 * Creates a new link (LinkSet entityset) object with the correct data filled in and return this object.
		 *
		 * @method		_getNewLinkObject
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{object}					Object for the Link-entity
		 * @private
		 */
		AttachmentManager.prototype._getNewLinkObject = function() {
			// ! 0 - Get JSON model content
			const { link, description } = this.getModel(
				"attachmentManagerLink"
			).getProperty("/");
			// ! 1 - Create Object
			return {
				ApplicationId: this.getApplicationId(),
				ObjectId: this.getObjectId(),
				ObjectType: this.getObjectType(),
				FileName: link,
				Description: description,
				IsUrl: true
			};
		};

		/**
		 * Creates a new entry in the UploadCollection for the given link.
		 * We keep this link in a dedicated pending upload array, so that when the users
		 * decides to start the upload we can actually upload the correct link in the back-end.
		 *
		 * This process is only triggered when the <strong>instantUpload</strong> property is set to false.
		 *
		 * @method		_createTemporaryLink
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{Object}				newLink						Link-object with information for the ODataModel.create call
		 * @private
		 */
		AttachmentManager.prototype._createTemporaryLink = function(newLink) {
			this._linkRequestId++;
			const requestValue = this._linkRequestId.toString();

			// Create new item in the UploadCollection
			let uploadCollectionItem = new UploadCollectionItem({
				fileName: newLink.Description,
				thumbnailUrl: "sap-icon://chain-link"
			});
			uploadCollectionItem._status = "pendingUploadStatus";
			uploadCollectionItem._requestIdName = requestValue;
			this.getRootControl().insertItem(uploadCollectionItem);
			this.getRootControl().aItems.unshift(uploadCollectionItem);

			// Keep track of the to be uploaded links
			this._pendingUploadLinks.push({
				requestIdValue: requestValue,
				link: newLink,
				item: uploadCollectionItem
			});

			// Clear the model
			this.getModel("attachmentManagerLink").setProperty("/link", null);
			this.getModel("attachmentManagerLink").setProperty("/description", null);
			// Don't forget to close the dialog
			this._addLinkDialog.close();
		};

		/**
		 * Adds the new link when legacy flag is off.
		 *
		 * @method		_addLinkLegacy
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @private
		 */
		AttachmentManager.prototype._addLink = function() {
			// TODO implement later
		};

		/**
		 * Creates a promise for the Link creation.
		 *
		 * @method		_createLinkAttachment
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{object}				data					Link object for the create call
		 * @returns		{promise}				Promise which is resolved once the Link is created, rejected otherwise
		 * @private
		 */
		AttachmentManager.prototype._createLinkAttachment = function(data) {
			return new Promise(
				function(resolve, reject) {
					this.getModel("attachmentManager").create("/LinkSet", data, {
						success: resolve,
						error: reject,
						refreshAfterChange: false
					});
				}.bind(this)
			);
		};

		/**
		 * Handles the file rename event when legacy flag is on.
		 *
		 * @method		_onLegacyAttachmentEdited
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.event}				event					fileRename-event
		 * @private
		 */
		AttachmentManager.prototype._onLegacyAttachmentEdited = function(event) {
			const context = event
					.getParameter("item")
					.getBindingContext("attachmentManager"),
				newFileName = event.getParameter("fileName"),
				path = context.getPath(),
				data = context.getObject();

			if (data.IsUrl) data.Description = newFileName;
			else data.FileName = newFileName;

			this.getModel("attachmentManager").update(path, data, {
				success: function() {
					this.getModel("attachmentManager").refresh();
				}.bind(this),
				error: function(error) {
					MessageBox.error("Could not update this attachment!");
				}.bind(this)
			});
		};

		/**
		 * Handles the file rename event when legacy flag is off.
		 *
		 * @method		_onLegacyAttachmentEdited
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.ui.base.event}				event					fileRename-event
		 * @private
		 */
		AttachmentManager.prototype._onAttachmentEdited = function(event) {
			// TODO when uploadSet is implemented
		};

		/**
		 * Returns a Promise array for all the possible actions that can occur when instant upload is set to false:
		 * <ul>
		 * 	<li>Upload attachment calls --> this is handled by the rootControl (UploadCollection/UploadSet)</li>
		 * 	<li>The Delete calls for attachments --> ODataModel.delete for the AttachmentSet entitySet</li>
		 * 	<li>The Delete calls for the Links --> ODataModel.delete for the LinkSet entitySet</li>
		 * 	<li>The upload calls for the Links --> ODataModel.create for the Links (that aren't deleted before triggering the upload)</li>
		 * </ul>
		 *
		 * @method		_getPromisesForUpload
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @returns		{Promise[]}						Array with promises for all the actions Upload/Delete
		 * @private
		 */
		AttachmentManager.prototype._getPromisesForUpload = function() {
			const attachmentsForDelete = this.getRootControl()
				.getPendingDeleteItems()
				.filter(this._isAttachment.bind(this));
			const linksForDelete = this.getRootControl()
				.getPendingDeleteItems()
				.filter(this._isLink.bind(this));
			const uniqueUploadLinks = this.getPendingUploadLinks().filter(
				this._isNotDeletedLink.bind(this)
			);

			return [
				...this._createUploadAttachmentsCalls(),
				...this._createDeleteAttachmentCalls(attachmentsForDelete),
				...this._createDeleteLinkCalls(linksForDelete),
				...this._createUploadLinkCalls(uniqueUploadLinks)
			];
		};

		/**
		 * Is the given item an attachment? Based on the property IsUrl on the binding.
		 *
		 * @method		_isAttachment
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.m.UploadCollectionItem}		item					Item that needs to be checked
		 * @returns		{boolean}												True when attachment, false otherwise
		 * @private
		 */
		AttachmentManager.prototype._isAttachment = function(item) {
			try {
				return !item
					.getBindingContext("attachmentManager")
					.getProperty("IsUrl");
			} catch (error) {
				Log.debug(
					"Item element does not have a bindingContext. Skipping item."
				);
				return false;
			}
		};

		/**
		 * Is the given item a Link? Based on the property IsUrl on the binding.
		 *
		 * @method		_isLink
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.m.UploadCollectionItem}		item					Item that needs to be checked
		 * @returns		{boolean}												True when Link, false otherwise
		 * @private
		 */
		AttachmentManager.prototype._isLink = function(item) {
			try {
				return item.getBindingContext("attachmentManager").getProperty("IsUrl");
			} catch (error) {
				Log.debug(
					"Item element does not have a bindingContext. Skipping item."
				);
				return false;
			}
		};

		/**
		 * Check if the item that needs to be uploaded not deleted in the meantime?
		 * A user can add a link, but can also delete it before the actual upload. So we need to be sure that this still
		 * exists at this point.
		 *
		 * @method		_isNotDeletedLink
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.m.UploadCollectionItem}		uploadItem					Item that needs to be checked
		 * @returns		{boolean}												True when link is not deleted, false otherwise
		 * @private
		 */
		AttachmentManager.prototype._isNotDeletedLink = function(uploadItem) {
			return (
				this.getRootControl()
					.getPendingDeleteItems()
					.filter(this._hasNoBindingContext)
					.filter(this._hasLinkThumbnail)
					.filter(
						deletedLink => deletedLink.getId() === uploadItem.item.getId()
					).length === 0 // when this uploadItem isn't found in the delete array we can upload it!
			);
		};

		/**
		 * Check if the item has no bindingContext.
		 *
		 * @method		_hasNoBindingContext
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.m.UploadCollectionItem}		item					Item that needs to be checked
		 * @returns		{boolean}												True when item has no binding context false otherwise
		 * @private
		 */
		AttachmentManager.prototype._hasNoBindingContext = function(item) {
			try {
				if (item.getBindingContext("attachmentManager")) return false;
				return true;
			} catch (error) {
				return true;
			}
		};

		/**
		 * Has the item a link thumbnailUrl.
		 *
		 * @method		_hasLinkThumbnail
		 * @author		Robin Panneels
		 * @memberof	rpan.lib.attachmentManager.Component
		 * @param			{sap.m.UploadCollectionItem}		item					Item that needs to be checked
		 * @returns		{boolean}												True when item has no binding context false otherwise
		 * @private
		 */
		AttachmentManager.prototype._hasLinkThumbnail = function(item) {
			return item.getProperty("thumbnailUrl") === "sap-icon://chain-link";
		};

		return AttachmentManager;
	}
);
