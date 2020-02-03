sap.ui.define(
	[
		"sap/m/UploadCollection",
		"sap/ui/unified/FileUploaderParameter",
		"sap/ui/unified/FileUploader",
		"sap/base/Log"
	],
	function(UploadCollection, FileUploaderParameter, FileUploader, Log) {
		"use strict";

		let myUploadCollection = UploadCollection.extend(
			"rpan.lib.UploadCollection",
			/** @lends rpan.lib.UploadCollection.prototype */ {
				metadata: {
					library: "rpan.lib",
					events: {
						/**
						 * Fires when the Number of attachments Title in the sap/m/UploadCollection is changed
						 * @since 1.0.0
						 */
						numberOfAttachmentsChange: {
							parameters: {
								/**
								 * Actual number of attachments in the collection
								 */
								actual: { type: "int" }
							}
						}
					}
				}
			}
		);

		/**
		 * Starts the upload for all selected files.
		 * @public
		 * @since 1.30.0
		 */
		myUploadCollection.prototype.upload = function() {
			if (this.getInstantUpload()) {
				Log.error(
					"Not a valid API call. 'instantUpload' should be set to 'false'."
				);
			}
			let iFileUploadersCounter = this._aFileUploadersForPendingUpload.length;
			// upload files that are selected through popup
			for (let i = 0; i < iFileUploadersCounter; i++) {
				this._iUploadStartCallCounter = 0;
				// if the FU comes from drag and drop (without files), ignore it
				if (this._aFileUploadersForPendingUpload[i].getValue()) {
					this._aFileUploadersForPendingUpload[i].upload();
				}
			}
			// upload files that are pushed through drag and drop
			if (this._aFilesFromDragAndDropForPendingUpload.length > 0) {
				// Inject the header parameters from the uploadCollection into the FileUploader
				this.getHeaderParameters().forEach(
					function(oHeaderParameter) {
						this._oFileUploader.addHeaderParameter(
							new FileUploaderParameter({
								name: oHeaderParameter.getName(),
								value: oHeaderParameter.getValue()
							})
						);
					}.bind(this)
				);
				// upload the files that are saved in the array
				this._oFileUploader._sendFilesFromDragAndDrop(
					this._aFilesFromDragAndDropForPendingUpload
				);
				// clean up the array
				this._aFilesFromDragAndDropForPendingUpload = [];
			}
		};

		myUploadCollection.prototype.getPendingDeleteItems = function() {
			// Avoid that duplicates are returned!
			return Array.from(new Set(this._aDeletedItemForPendingUpload));
		};

		myUploadCollection.prototype.getPendingUploadItems = function() {
			return this._aFileUploadersForPendingUpload;
		};

		myUploadCollection.prototype._setNumberOfAttachmentsTitle = function(
			count
		) {
			if (UploadCollection.prototype._setNumberOfAttachmentsTitle) {
				UploadCollection.prototype._setNumberOfAttachmentsTitle.apply(
					this,
					arguments
				);
			}

			this.fireNumberOfAttachmentsChange({
				actual: count
			});
		};

		myUploadCollection.prototype.clearAfterUpload = function() {
			if (this.getInstantUpload()) {
				Log.error(
					"Clearing of the pending upload/delete arrays only supported when instantUpload is false!"
				);
				return;
			}

			// Clear pending arrays
			this._aDeletedItemForPendingUpload = [];
			this._aFileUploadersForPendingUpload = [];

			// Destroy the unneeded fileUploaders
			this._oHeaderToolbar
				.getContent()
				.filter(this._getNotActiveFileUploaders.bind(this))
				.forEach(this._removeFileUploaders.bind(this));
		};

		myUploadCollection.prototype._getNotActiveFileUploaders = function(
			item,
			index
		) {
			return item instanceof FileUploader && index !== this._iFileUploaderPH;
		};

		myUploadCollection.prototype._removeFileUploaders = function(
			fileUploader
		) {
			// Remove the unneeded FileUploader from the content of the header toolbar
			this._oHeaderToolbar.removeContent(fileUploader);
			// Destroy it as we don't need it anymore
			fileUploader.destroy();
		};

		return myUploadCollection;
	}
);
