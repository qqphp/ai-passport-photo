import type { PhotoCategory } from "@/types/photo";
import photoData from "@/data/merged_response.json";

// 处理原始数据
const processPhotoData = () => {
  const data = photoData.data.list;
  
  // 标准证件照
  const standardPhotos = data.filter(item => item.print === 1).map(item => ({
    id: `photo-${item.id}`,
    name: item.name,
    width: item.width,
    height: item.height,
    print: item.print as 1 | 2,
    specs: item.specs,
    sd_width: item.sd_width,
    sd_height: item.sd_height,
    sd_dpi: item.sd_dpi,
  }));

  // 考试报名照
  const examPhotos = data.filter(item => 
    item.print === 2 && (
      item.name.includes("考试") ||
      item.name.includes("公务员") ||
      item.name.includes("资格证")
    )
  );

  // 证照办理
  const certificatePhotos = data.filter(item =>
    item.print === 2 && (
      item.name.includes("证件照") ||
      item.name.includes("工作证") ||
      item.name.includes("驾驶证") ||
      item.name.includes("保安员证")
    )
  );

  // 学籍类照片
  const educationPhotos = data.filter(item =>
    item.print === 2 && (
      item.name.includes("学籍") ||
      item.name.includes("毕业") ||
      item.name.includes("入学") ||
      item.name.includes("学生")
    )
  );

  // 细分考试类别
  const civilServiceExams = examPhotos.filter(photo => 
    photo.name.includes("公务员") || 
    photo.name.includes("国考") || 
    photo.name.includes("省考")
  );

  const accountingExams = examPhotos.filter(photo => 
    photo.name.includes("会计") || 
    photo.name.includes("注册会计师") ||
    photo.name.includes("银行从业")
  );

  const educationExams = examPhotos.filter(photo => 
    photo.name.includes("教师资格") ||
    photo.name.includes("研究生") ||
    photo.name.includes("英语") ||
    photo.name.includes("四六级") ||
    photo.name.includes("四八级") ||
    photo.name.includes("普通话") ||
    photo.name.includes("自考专升本")
  );

  const medicalExams = examPhotos.filter(photo => 
    photo.name.includes("护士") ||
    photo.name.includes("医师") ||
    photo.name.includes("卫生资格") ||
    photo.name.includes("护师") ||
    photo.name.includes("药师")
  );

  const computerExams = examPhotos.filter(photo => 
    photo.name.includes("计算机") ||
    photo.name.includes("软件") ||
    photo.name.includes("大数据")
  );

  return {
    standardPhotos,
    civilServiceExams,
    accountingExams,
    educationExams,
    medicalExams,
    computerExams,
    certificatePhotos,
    educationPhotos,
  };
};

const {
  standardPhotos,
  civilServiceExams,
  accountingExams,
  educationExams,
  medicalExams,
  computerExams,
  certificatePhotos,
  educationPhotos,
} = processPhotoData();

const mapPhotoToSize = (photo: any) => ({
  id: `photo-${photo.id}`,
  name: photo.name,
  width: photo.width,
  height: photo.height,
  print: photo.print,
  specs: photo.specs,
  sd_width: photo.sd_width,
  sd_height: photo.sd_height,
  sd_dpi: photo.sd_dpi,
});

export const photoCategories: PhotoCategory[] = [
  {
    id: "standard",
    name: "标准证件照",
    sizes: standardPhotos.map(mapPhotoToSize),
  },
  {
    id: "exam",
    name: "考试报名照",
    subcategories: [
      {
        id: "civil-service",
        name: "公务员考试",
        sizes: civilServiceExams.map(mapPhotoToSize),
      },
      {
        id: "accounting",
        name: "财会类考试",
        sizes: accountingExams.map(mapPhotoToSize),
      },
      {
        id: "education",
        name: "教育类考试",
        sizes: educationExams.map(mapPhotoToSize),
      },
      {
        id: "medical",
        name: "医疗卫生类",
        sizes: medicalExams.map(mapPhotoToSize),
      },
      {
        id: "computer",
        name: "计算机类考试",
        sizes: computerExams.map(mapPhotoToSize),
      },
    ],
  },
  {
    id: "certificate",
    name: "证照办理",
    sizes: certificatePhotos.map(mapPhotoToSize),
  },
  {
    id: "education",
    name: "学籍类照片",
    subcategories: [
      {
        id: "student-record",
        name: "学籍照片",
        sizes: educationPhotos
          .filter(photo => photo.name.includes("学籍"))
          .map(mapPhotoToSize),
      },
      {
        id: "graduation",
        name: "毕业学历照片",
        sizes: educationPhotos
          .filter(photo => photo.name.includes("毕业"))
          .map(mapPhotoToSize),
      },
      {
        id: "college-image",
        name: "大学生图像信息采集",
        sizes: educationPhotos
          .filter(photo => photo.name.includes("图像信息采集"))
          .map(mapPhotoToSize),
      },
      {
        id: "kindergarten",
        name: "幼儿园入学相片",
        sizes: educationPhotos
          .filter(photo => photo.name.includes("幼儿园") || photo.name.includes("入学"))
          .map(mapPhotoToSize),
      },
    ],
  },
]; 