import { useEffect } from "react";
import { getDatabase, ref, onValue } from 'firebase/database';

const useFetchTrees = (setTrees: React.Dispatch<React.SetStateAction<Tree[]>>, config: any) => {

            useEffect(() => {
                const database = getDatabase(config);
                const treesRef = ref(database, "trees");
                const speciesRef = ref(database, "species");
                const sectorsRef = ref(database, "sectors");
            
                // Listen to changes of Species
                onValue(speciesRef, (snapshot) => {
                    const speciesItem = snapshot.val();
                    let speciesArray: { [key: string]: Species } = {}; // Store species
            
                    // Convert species into an object to find by id
                    if (speciesItem) {
                        speciesArray = Object.fromEntries(
                            Object.entries(speciesItem).map(([key, value]) => [
                                key,
                                {
                                    commonName: (value as Species).commonName,
                                    scientificName: (value as Species).scientificName,
                                    foliage: (value as Species).foliage
                                }
                            ])
                        );
                    }
            
                    // Listen to changes of Sectors
                    onValue(sectorsRef, (snapshot) => {
                        const sectorItem = snapshot.val();
                        let sectorArray: { [key: string]: Sector } = {}; // Store sectors
            
                        // Convert sectors into an object to find by id
                        if (sectorItem) {
                            sectorArray = Object.fromEntries(
                                Object.entries(sectorItem).map(([key, value]) => [
                                    key,
                                    {
                                        name: (value as Sector).name,
                                        polygon: (value as Sector).polygon
                                    }
                                ])
                            );
                        }
            
                        // Listen to changes of Trees
                        onValue(treesRef, (snapshot) => {
                            const dataItem = snapshot.val();
            
                            if (dataItem) {
                                const displayItem: Tree[] = Object.values(dataItem).map((value) => {
                                    // Convert to Tree type
                                    const tree = value as Tree;
            
                                    return {
                                        ...tree,
                                        species: speciesArray[tree.speciesId] || undefined,  // Assign the species object or undefined
                                        sector: sectorArray[tree.sectorId] || undefined     // Assign the sector object or undefined
                                    } as Tree; // Convert to Tree type
                                });
            
                                console.log('Datos de árboles con especies y sectores:', displayItem);
                                setTrees(displayItem); // Update state with trees including species and sector info
                            } else {
                                console.log('No se encontraron árboles.');
                            }
                        }, (error) => {
                            console.error("Error al obtener los datos de árboles:", error);
                        });
            
                    }, (error) => {
                        console.error("Error al obtener los datos de sectores:", error);
                    });
            
                }, (error) => {
                    console.error("Error al obtener los datos de especies:", error);
                });
            
            }, [setTrees, config]);
            
            
}


export default useFetchTrees;