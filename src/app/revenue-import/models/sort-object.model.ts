export class SortObject {
  byDate: SortType;
  byClientName: SortType;
  byProductNum: SortType;
}

enum SortType {
    ASC,
    DSC
}
