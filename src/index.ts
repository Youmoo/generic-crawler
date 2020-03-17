/**
 * 每一页的数据类型
 */
export type Page<T, E> = {
    data: T[],
} & E


/**
 * 爬虫工厂
 *
 * @typeParam PageParam 分页查询参数的类型
 * @typeParam PageItem 每页中单个记录的类型
 * @typeParam PageExtra 每页额外信息的类型
 * @typeParam Detail 单个记录详情的类型
 */
export class Crawler<PageParam, PageItem, PageExtra, Detail> {

    private pageParams: PageParam;
    private paginate: (p: PageParam) => Promise<Page<PageItem, PageExtra>>;
    private nextPageParam: (arg: { pageParams: PageParam, prevPage: Page<PageItem, PageExtra> }) => PageParam;
    private detail: (arg: { item: PageItem, pageParams: PageParam }) => Promise<Detail>;

    /**
     * 初始分页查询参数
     */
    pageParam(p: PageParam) {
        this.pageParams = p;
        return this;
    }

    /**
     * 设置分页查询函数
     */
    pageFunc(f: (p: PageParam) => Promise<Page<PageItem, PageExtra>>) {
        this.paginate = f;
        return this;
    }

    /**
     * 设置用来获取下一页查询参数的函数
     */
    nextPageParamFunc(f: (arg: { pageParams: PageParam, prevPage: Page<PageItem, PageExtra> }) => PageParam) {
        this.nextPageParam = f;
        return this;
    }

    /**
     * 获取详情
     */
    detailFunc(f: (arg: { item: PageItem, pageParams: PageParam, page: Page<PageItem, PageExtra> }) => Promise<Detail>) {
        this.detail = f;
        return this;
    }

    /**
     * 获取所有详情数据
     */
    async* all() {
        let {pageParams} = this;

        while (true) {
            const page = await this.paginate(pageParams);

            if (!page.data || !page.data.length) {
                // 爬完了
                return;
            }

            for (const item of page.data) {
                const detail = await this.detail({item, pageParams});
                const stop = yield detail;
                if (stop) {
                    return;
                }
            }
            pageParams = this.nextPageParam({pageParams, prevPage: page});
            if (!pageParams) {
                return;
            }
        }
    }
}
