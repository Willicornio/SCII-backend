import md5 from 'md5';

export const defaultState= {
    users:[{

        id: "alcalde",
        name: 'Sergia',
        passwordHash:md5("alcalde")

    }]
}