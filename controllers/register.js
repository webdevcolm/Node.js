
const saltRounds = 10;

const handleRegister = (req,res,db,bcrypt)=>{
  const {email,name,password} = req.body ;
  if(!email || !name || !password){
    return res.status(400).json('incorrect form submission')
  }
  const hash = bcrypt.hashSync(password, saltRounds);
  console.log(process.env.DATABASE_URL)
  db.transaction(trx=>{
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail=>{
      return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0].email,
              name: name,
              joined: new Date()
                })
                .then(user=> res.json(user[0]))
                })
                .then(trx.commit)
                .catch(trx.rollback)
          })
          .catch(err=>res.status(404).json('not found'))
          
 
}

export default handleRegister