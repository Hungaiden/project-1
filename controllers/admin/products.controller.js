const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");

const moment = require("moment");
const systemConfig = require("../../config/system");
module.exports.index = async (req, res) => {
  const find = {
    deleted : false
  }

  // lọc theo trạng thái
  if(req.query.status) {
    find.status = req.query.status;
  }
// hết lọc theo trạng thái


// Tìm kiếm
  if(req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.title = regex;
  }
// Hết tìm kiếm


//Phân trang
  let limitItems = 4;
  let page = 1;

  if(req.query.limit) {
    limitItems = parseInt(req.query.limit);
  }

  if(req.query.page) {
    page = parseInt(req.query.page);
  }
  const skip = (page - 1) * limitItems;
  
  // Tính tổng số trang
  const totalProduct = await Product.countDocuments(find);
  const totalPage = Math.ceil(totalProduct / limitItems);
  
//Hết phân trang
  
// const products = await Product.find(find).limit(limitItems).skip(skip);
  const sort = {};

  if(req.query.sortKey && req.query.sortValue) {
    const sortKey = req.query.sortKey;
    const sortValue = req.query.sortValue;

    sort[sortKey] = sortValue;
  }
  else {
    sort["position"] = "asc";
  }
  const products = await Product
    .find(find)
    .limit(limitItems)
    .skip(skip)
    .sort(sort);
  
    // Them log lich su thay doi san pham
  for(const item of products) {
    const inforCreated = await Account.findOne({
      _id : item.createdBy
    });

    if(inforCreated) {
      item.createdByFullName = inforCreated.fullName;
    }
    else {
      item.createdByFullName = "";
    }

    if(item.createdAt) {
      item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YY");
    }   
  }

  for(const item of products) {
    const inforUpdated = await Account.findOne({
      _id : item.updatedBy
    });

    if(inforUpdated) {
      item.updatedByFullName = inforUpdated.fullName;
    }
    else {
      item.updatedByFullName = "";
    }

    if(item.updatedAt) {
      item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YY");
    }  
  }
  // het them log thay doi lich su san pham
  
  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    totalPage: totalPage,// trả ra ngoài giao diện
    currentPage: page,
    limitItems: limitItems
  });
}

module.exports.changeStatus = async (req, res) => {
  if(res.locals.role.permissions.includes("products_edit")) {
    await Product.updateOne({
      _id: req.body.id
    }, {
      status: req.body.status,
      updatedBy :res.locals.user.id,
      updatedAt : new Date()
    });

    req.flash('success', 'Đổi trạng thái thành công!');

    res.json({
      code: "success"
    });
  }
}

module.exports.changeMulti = async (req, res) => {
  // await Product.updateMany({
  //   _id: req.body.ids
  // }, {
  //   status: req.body.status
  // });

  // res.json({
  //   code: "success",
  //   message: "Đổi trạng thái thành công!"
  // });
  if(res.locals.role.permissions.includes("products_edit")) {
    switch (req.body.status) {
      case "active":
        await Product.updateMany({
          _id: req.body.ids
        }, {
          status: req.body.status,
          updatedBy :res.locals.user.id,
          updatedAt : new Date()
        });
        
        req.flash('success', 'Đổi trạng thái thành công!');

        res.json({
          code: "success"
        });
        break;
      

      case "inactive":
        await Product.updateMany({
          _id: req.body.ids
        }, {
          status: req.body.status,
          updatedBy :res.locals.user.id,
          updatedAt : new Date()
        });
        
        req.flash('success', 'Đổi trạng thái thành công!');

        res.json({
          code: "success"
        });
        break;
      case "delete":
        await Product.updateMany({
          _id: req.body.ids
        }, {
          deleted: "true",
          deleteddBy :res.locals.user.id,
          deleteddAt : new Date()
        });
      
        req.flash('success', 'Xoá thành công!');
        res.json({
          code: "success"
        });
        break;
      default:
        req.flash('success', 'Trạng thái không hợp lệ!');
        res.json({
          code: "error"
        });
        break;
    }
  }
}


module.exports.delete = async (req, res) => {
  if(res.locals.role.permissions.includes("products_delete")) {
    await Product.updateOne({
      _id: req.body.id
    },{
      deleted: true,
      deleteddBy :res.locals.user.id,
      deleteddAt : new Date()
    }
    );

    req.flash('success', 'Xoá thành công!');

    res.json({
      code: "success"
    });
  }
}

module.exports.changePosition = async (req, res) => {
  if(res.locals.role.permissions.includes("products_edit")) {
    await Product.updateOne({
      _id: req.body.id
    },{
      position: req.body.position,
      updatedBy :res.locals.user.id,
      updatedAt : new Date()
    });

    req.flash('success', 'Đổi vị trí thành công!');

    res.json({
      code: "success"
    })
  }
}

module.exports.create = async (req, res) => {
  const listCategory = await ProductCategory.find({
    deleted: false
  });
  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm",
    listCategory: listCategory
  });
}

module.exports.createPost = async(req, res) => {
  if(res.locals.role.permissions.includes("products_create")) {
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    
    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    }
    else {
      const count = await Product.countDocuments();
      req.body.position = count + 1;
    }
  
    req.body.createdBy = res.locals.user.id;
    req.body.createdAt = new Date();
   
    const record = new Product(req.body);
  
    await record.save(); // đợi đến khi thêm bản ghi xong
  
    res.redirect(`/${systemConfig.prefixAdmin}/products`);
  }
}

module.exports.edit = async (req, res) => {
  const id = req.params.id;

  const listCategory = await ProductCategory.find({
    deleted: false
  });
  const product = await Product.findOne({
    _id: id,
    deleted: false
  });

  res.render("admin/pages/products/edit", {
    pageTitle: "Chỉnh sửa sản phẩm",
    product: product,
    listCategory: listCategory
  });
}

module.exports.editPatch = async(req, res) => {
  if(res.locals.role.permissions.includes("products_edit")) {
    const id = req.params.id;

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    
    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    }

    // ghi log thay doi
    req.body.updatedBy = res.locals.user.id;
    req.body.updatedAt = new Date();
    await Product.updateOne({
      _id: id,
      deleted: false
    }, req.body)

    req.flash("success", "Cập nhật thành công !")
    res.redirect("back");
  }
}


module.exports.detail = async (req, res) => {
  if(res.locals.role.permissions.includes("products_view")) {
    const id = req.params.id;

    const product = await Product.findOne({
      _id: id,
      deleted: false
    });

    res.render("admin/pages/products/detail", {
      pageTitle: "Chi tiết sản phẩm",
      product: product
    });
  }
}

