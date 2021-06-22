import joi from 'joi'

const signUpSchema = joi.object({
    name: joi.string()
        .pattern(new RegExp('^[a-zA-Z]{3,50}$'))
        .required(),
    email: joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net' ] } })
        .required(),
    password: joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
    repeat_password: joi.ref('password'),
})

export default signUpSchema;