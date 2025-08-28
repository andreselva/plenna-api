export interface IReports<I, O> {
  proccess(input: I): Promise<O>;
}