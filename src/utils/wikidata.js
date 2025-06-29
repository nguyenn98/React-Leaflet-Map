export const getLogoFromWikidata = async (wikidataId) => {
    try {
        const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`);
        const data = await res.json();

        const logoFileName =
            data?.entities?.[wikidataId]?.claims?.P154?.[0]?.mainsnak?.datavalue?.value;

        if (logoFileName) {
            return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(logoFileName)}`;
        }

        return null;
    } catch (err) {
        console.error("Lỗi lấy logo Wikidata", err);
        return null;
    }
};
