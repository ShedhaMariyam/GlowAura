const User =  require ('../../models/userSchema');
const HTTP_STATUS = require('../../helpers/httpStatus');



const customerInfo = async(req,res)=>{
    try {
     
            let search ="";
            if(req.query.search){
                search = req.query.search;
            }
            let page=1;
            if(req.query.page){
                page=req.query.page
            }
            const limit=3
            const userData = await User.find({
                is_admin : false,
                $or : [
                    {name:{$regex :".*"+search+".*",$options: "i"}},
                    {email: {$regex:".*"+search+".*",$options: "i"}}
                ],
            })
            .sort({createdOn:-1})
            .limit(limit*1)
            .skip((page-1)*limit)
            .exec();

            const count = await User.find({
                is_admin : false,
                $or : [
                    {name:{$regex :".*"+search+".*"}},
                    {email: {$regex:".*"+search+".*"}}
                ],
            }).countDocuments();

            res.render('users',{
                data:userData,
                totalPages:Math.ceil(count/limit),
                currentPage:page,
                resultsCount: count,
                search,
                activePage: "users"
            })

    } catch (error) {
        console.error('customerInfo error:', error);
         res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .redirect('/page-error');
}

}

const userBlocked = async (req,res)=>{
    try {
        let id=req.query.id;
        await User.updateOne({_id:id},{$set:{is_Blocked :true}})
        res.redirect('/admin/users')
    } catch (error) {
        console.error('userBlocked error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .redirect('/page-error');
    }
}

const userUnblocked = async (req,res)=>{
    try {
        let id=req.query.id;
        await User.updateOne({_id:id},{$set:{is_Blocked :false}})
        res.redirect('/admin/users')
    } catch (error) {
        console.error('userUnblocked error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .redirect('/page-error');
}

}

module.exports ={
    customerInfo,
    userBlocked,
    userUnblocked
}