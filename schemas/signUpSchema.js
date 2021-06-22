import joi from 'joi'

const signUpSchema = joi.object({
    name: joi.string().max(50).required,
    email: joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: joi.ref('password'),
})

export default signUpSchema;