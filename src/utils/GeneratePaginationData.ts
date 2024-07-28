const generatePaginationData = async (req: any, totalDocs: any) => {
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);

    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = skip > 1;
    const hasNextPage = skip < totalPages;

    return {
        currentPage: skip,
        pageSize: limit,
        totalDocs: totalDocs,
        totalPages: totalPages,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage
    };
};

export default generatePaginationData;
