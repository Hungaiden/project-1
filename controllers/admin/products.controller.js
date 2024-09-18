const Product = require("../../models/product.models");

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

  const products = await Product
  .find(find)
  .limit(limitItems)
  .skip(skip)
  .sort({
    position: "ascending"
  });

  res.render("admin/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    totalPage: totalPage,// trả ra ngoài giao diện
    currentPage: page
  });
}

module.exports.changeStatus = async (req, res) => {
  await Product.updateOne({
    _id: req.body.id
  }, {
    status: req.body.status
  });

  req.flash('success', 'Đổi trạng thái thành công!');

  res.json({
    code: "success"
  });
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
  switch (req.body.status) {
    case "active":
      await Product.updateMany({
        _id: req.body.ids
      }, {
        status: req.body.status
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
        status: req.body.status
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
        deleted: "true"
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


module.exports.delete = async (req, res) => {
  await Product.updateOne({
    _id: req.body.id
  },{
    deleted: true
  }
  );

  req.flash('success', 'Xoá thành công!');

  res.json({
    code: "success"
  });
}

module.exports.changePosition = async (req, res) => {
  await Product.updateOne({
    _id: req.body.id
  },{
    position: req.body.position
  });

  req.flash('success', 'Đổi vị trí thành công!');

  res.json({
    code: "success"
  })
}

module.exports.create = async (req, res) => {
  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm"
  });
}

module.exports.createPost = async(req, res) => {
  console.log(req.body);

  res.send("OK");
}