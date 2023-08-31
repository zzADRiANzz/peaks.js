/**
 * @file
 *
 * Defines the {@link DefaultSegmentMarker} class.
 *
 * @module default-segment-marker
 */

import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text } from 'konva/lib/shapes/Text';

/**
 * Creates a segment marker handle.
 *
 * @class
 * @alias DefaultSegmentMarker
 *
 * @param {CreateSegmentMarkerOptions} options
 */

function DefaultSegmentMarker(options) {
  this._options = options;
  this._editable = options.editable;
}

DefaultSegmentMarker.prototype.init = function(group) {
  const handleWidth  = 15;
  const handleHeight = 48;
  let handleX      = -(handleWidth / 2) - 8; // Place off to the side of the segment

  handleX = this._options.startMarker ? (handleX * -1) - 14.9 : handleX;

  const xPosition = this._options.startMarker ? -24 : 24;

  const time = this._options.startMarker ? this._options.segment.startTime :
                                           this._options.segment.endTime;

  const handleLineColor = this._options.segment.borderColor;

  const handleColor = this._options.segment.handleColor;

  // Label - create with default y, the real value is set in fitToView().
  this._label = new Text({
    x:          xPosition,
    y:          0,
    text:       this._options.layer.formatTime(time),
    fontFamily: this._options.fontFamily,
    fontSize:   this._options.fontSize,
    fontStyle:  this._options.fontStyle,
    fill:       '#000',
    textAlign:  'center',
    visible:    this._editable
  });

  this._label.hide();

  // Handle - create with default y, the real value is set in fitToView().
  this._handle = new Rect({
    x:           handleX,
    y:           0,
    width:       handleWidth,
    height:      handleHeight,
    fill:        handleColor,
    stroke:      handleColor,
    strokeWidth: 0
  });

  this._handleLineOne = new Rect({
    name: 'handleLineOne',
    x: handleX + 4.5,
    y: 0,
    width: 0.5,
    height: 16,
    fill: handleLineColor,
    stroke: handleLineColor,
    strokeWidth: 1
  });

  this._handleLineTwo = new Rect({
    name: 'handleLineTwo',
    x: handleX + 9.5,
    y: 0,
    width: 0.5,
    height: 16,
    fill: handleLineColor,
    stroke: handleLineColor,
    strokeWidth: 1
  });

  this._handleLineSingle = new Rect({
    name: 'handleLineSingle',
    x: handleX + 7,
    y: 0,
    width: 0.5,
    height: 16,
    fill: handleLineColor,
    stroke: handleLineColor,
    strokeWidth: 1,
    cornerRadius: 2,
    visible:     this._editable
  });

  // Vertical Line - create with default y and points, the real values
  // are set in fitToView().
  this._line = new Line({
    x:           0,
    y:           0,
    stroke:      this._options.color,
    strokeWidth: 1,
    visible:     this._editable
  });

  group.add(this._label);
  // group.add(this._line);
  group.add(this._handleLineOne);
  group.add(this._handleLineTwo);
  group.add(this._handleLineSingle);
  group.add(this._handle);

  this.fitToView();

  this.bindEventHandlers(group);

  setTimeout(() => {
    let focusedSegmentShape;
    const segmentShapes = this._options.layer._segmentShapes;

    for (const [value] of Object.entries(segmentShapes)) {
      const segmentShape = segmentShapes[value];

      if (segmentShape._endMarker !== null) {
        focusedSegmentShape = segmentShape;
        break;
      }
    }

    const segmentShapeWidth = focusedSegmentShape._overlay.width();

    if (segmentShapeWidth <= 32.5) {
      const markerInfo = this.getMarkerInfo(focusedSegmentShape);

      this.updateMarkersSmall(segmentShapeWidth, markerInfo);
    }
  }, 0);
};

DefaultSegmentMarker.prototype.bindEventHandlers = function(group) {
  const self = this;

  // const xPosition = self._options.startMarker ? -24 : 24;

  if (self._options.draggable) {
    group.on('dragstart', function() {
      // self._handle.attrs.fill = '#3641414D'; // neutral-800 .30a
      // self._handle.attrs.stroke = '#3641414D'; // neutral-800 .30a
      // if (self._options.startMarker) {
      //   self._label.setX(xPosition - self._label.getWidth());
      // }

      // self._label.show();
    });

    group.on('dragend', function() {
      // self._label.hide();
    });
  }

  self._handle.on('mouseover touchstart', function() {
    document.body.style.cursor = 'col-resize';
    // self._handle.attrs.fill = '#3641414D'; // neutral-800 .30a
    // self._handle.attrs.stroke = '#3641414D'; // neutral-800 .30a
    // if (self._options.startMarker) {
    //   self._label.setX(xPosition - self._label.getWidth());
    // }

    // self._label.show();
    this.parent.parent.draw();
  });

  self._handle.on('mouseout touchend', function() {
    document.body.style.cursor = 'default';
    // self._handle.attrs.fill = '#6E797A4D'; // neutral-600 .30a
    // self._handle.attrs.stroke = '#6E797A4D'; // neutral-600 .30a
    // self._label.hide();
    this.parent.parent.draw();
  });
};

DefaultSegmentMarker.prototype.fitToView = function() {
  const height = this._options.layer.getHeight();

  this._label.y(height / 2 - 5);
  this._handle.y(height / 2 + 45);
  this._handleLineOne.y(height / 2 + 61);
  this._handleLineTwo.y(height / 2 + 61);
  this._handleLineSingle.y(height / 2 + 61);
  // this._line.points([0.5, 0, 0.5, height]);
};

DefaultSegmentMarker.prototype.updateMarkersSmall = function(segmentShapeWidth, markerInfo) {
  const { endMarkerHandleLineSingle, startMarkerHandleLineSingle } = markerInfo;
  const newHandleWidth = (segmentShapeWidth / 2) - 0.5;

  markerInfo.endMarker._handle.x(-newHandleWidth + 1);
  markerInfo.startMarker._handle.attrs.width = newHandleWidth;
  markerInfo.endMarker._handle.attrs.width = newHandleWidth;

  markerInfo.endMarkerHandleLines.forEach(line => line.hide());
  endMarkerHandleLineSingle.show();
  endMarkerHandleLineSingle.x((newHandleWidth / 2) - newHandleWidth);
  markerInfo.startMarkerHandleLines.forEach(line => line.hide());
  startMarkerHandleLineSingle.show();
  startMarkerHandleLineSingle.x(newHandleWidth / 2);
};

DefaultSegmentMarker.prototype.getMarkerInfo = function(segmentShape) {
  const { _endMarker, _startMarker } = segmentShape;
  const endMarker = _endMarker._marker;
  const endMarkerGroupChildren = _endMarker._group.children;
  const startMarker = _startMarker._marker;
  const startMarkerGroupChildren = _startMarker._group.children;

  const endMarkerHandleLines = endMarkerGroupChildren.filter(
    child => child.attrs.name === 'handleLineOne' || child.attrs.name === 'handleLineTwo');
  const endMarkerHandleLineSingle = endMarkerGroupChildren.find(
    child => child.attrs.name === 'handleLineSingle');
  const startMarkerHandleLines = startMarkerGroupChildren.filter(
    child => child.attrs.name === 'handleLineOne' || child.attrs.name === 'handleLineTwo');
  const startMarkerHandleLineSingle = startMarkerGroupChildren.find(
    child => child.attrs.name === 'handleLineSingle');

  return {
    endMarker,
    startMarker,
    endMarkerHandleLines,
    endMarkerHandleLineSingle,
    startMarkerHandleLines,
    startMarkerHandleLineSingle
  };
};

DefaultSegmentMarker.prototype.update = function(options) {
  if (options.startTime !== undefined && this._options.startMarker) {
    let focusedSegmentShape;
    const segmentShapes = this._options.layer._segmentShapes;

    for (const [value] of Object.entries(segmentShapes)) {
      const segmentShape = segmentShapes[value];

      if (segmentShape._endMarker !== null) {
        focusedSegmentShape = segmentShape;
        break;
      }
    }

    const markerInfo = this.getMarkerInfo(focusedSegmentShape);

    const segmentShapeWidth = focusedSegmentShape._overlay.width();

    if (segmentShapeWidth <= 32.5) {
      this.updateMarkersSmall(segmentShapeWidth, markerInfo);
    }
    else {
      const handleX = -(15 / 2) - 8;
      const startHandleX = handleX * -1 - 14.9;
      const endHandleX = handleX;

      markerInfo.endMarker._handle.x(endHandleX);
      markerInfo.startMarker._handle.x(startHandleX);

      markerInfo.startMarker._handle.attrs.width = 15;
      markerInfo.endMarker._handle.attrs.width = 15;

      markerInfo.endMarkerHandleLines.forEach(line => line.show());
      markerInfo.endMarkerHandleLineSingle.hide();
      markerInfo.startMarkerHandleLines.forEach(line => line.show());
      markerInfo.startMarkerHandleLineSingle.hide();
    }

    this._label.text(this._options.layer.formatTime(options.startTime));
  }

  if (options.endTime !== undefined && !this._options.startMarker) {
    this._label.text(this._options.layer.formatTime(options.endTime));
  }

  if (options.editable !== undefined) {
    this._editable = options.editable;

    this._label.visible(this._editable);
    this._handle.visible(this._editable);
    this._line.visible(this._editable);
  }
};

export default DefaultSegmentMarker;
