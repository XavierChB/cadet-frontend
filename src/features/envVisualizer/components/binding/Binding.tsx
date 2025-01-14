import React from 'react';

import { Config } from '../../EnvVisualizerConfig';
import { Layout } from '../../EnvVisualizerLayout';
import { Data, Visible } from '../../EnvVisualizerTypes';
import { Arrow } from '../Arrow';
import { Frame } from '../Frame';
import { Text } from '../Text';
import { Value } from './Value';
import { ArrayValue } from './value/ArrayValue';
import { FnValue } from './value/FnValue';
import { GlobalFnValue } from './value/GlobalFnValue';
import { PrimitiveValue } from './value/PrimitiveValue';

/** a `binding` is a key-value pair in a frame */
export class Binding implements Visible {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** value associated with this binding */
  readonly value: Value;
  /** key of this binding */
  readonly key: Text;

  constructor(
    /** the key of this binding */
    readonly keyString: string,
    /** the value of this binding */
    readonly data: Data,
    /** frame this binding is in */
    readonly frame: Frame,
    /** previous binding (the binding above it) */
    readonly prevBinding: Binding | null
  ) {
    // derive the coordinates from the binding above it
    if (this.prevBinding) {
      this.x = this.prevBinding.x;
      this.y = this.prevBinding.y + this.prevBinding.height + Config.TextPaddingY;
    } else {
      this.x = this.frame.x + Config.FramePaddingX;
      this.y = this.frame.y + Config.FramePaddingY;
    }

    this.keyString += Config.VariableColon;
    this.value = Layout.createValue(data, this);

    const keyYOffset =
      this.value instanceof ArrayValue
        ? (Config.DataUnitHeight - Config.FontSize) / 2
        : (this.value.height - Config.FontSize) / 2;

    this.key = new Text(this.keyString, this.x, this.y + keyYOffset);

    // derive the width from the right bound of the value
    this.width =
      this.value.x +
      this.value.width -
      this.x +
      (this.value instanceof FnValue || this.value instanceof GlobalFnValue
        ? this.value.textDescriptionWidth
        : 0);
    this.height = Math.max(this.key.height, this.value.height);
  }

  draw(): React.ReactNode {
    let arrowPoints: number[] = [];
    if (!(this.value instanceof PrimitiveValue)) {
      const from: Text = this.key,
        to: Value = this.value;

      arrowPoints = [from.x + from.width, from.y + from.height / 2];
      if (to instanceof ArrayValue) arrowPoints.push(to.x, to.y + Config.DataUnitHeight / 2);
      else arrowPoints.push(to.x, to.y);
    }

    return (
      <React.Fragment key={Layout.key++}>
        {this.key.draw()}
        {this.value.draw()}
        {arrowPoints && new Arrow(arrowPoints).draw()}
      </React.Fragment>
    );
  }
}
