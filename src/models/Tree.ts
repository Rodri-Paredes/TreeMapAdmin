interface Tree {
        speciesId: string,
        code: string,
        dateBirth: string,
        diameter: number,
        deleteDate: string,
        latitude: number,
        longitude: number,
        modifyDate: string,
        sectorId: string,
        imageUrl: string,
        species?: Species,
        sector?: Sector
}