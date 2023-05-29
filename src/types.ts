export type Message = {
  text: string;
  type: 'request' | 'response';
  pending?: true;
}

export type Instruction = {
  type: 'LOCATION_CHANGE',
  func: 'setCenter' | 'setFitBounds',
  locationName: string
} | {
  type: 'STYLE_CHANGE',
  layerName: string,
  propertyPath: string,
  value: string,
}
