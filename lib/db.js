import { MongoClient } from "mongodb";
import clientPromise from "mongodb";

let client;

// if (!clientPromise) {
//   client = new MongoClient(
//     "mongodb+srv://dungbui1110:dragonnica2001@cluster0.hm6gngk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//   );

//   clientPromise = client.connect();
// }

export async function connectToDatabase() {
  client = new MongoClient(
    "mongodb+srv://dungbui1110:dragonnica2001@cluster0.hm6gngk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );

  client = await client.connect();
  return client;
}

// Function to add dummy data to the "recipe" collection
export async function addDummyData() {
  // Dummy recipe data
  const dummyRecipes = [
    {
      recipe_name: "Bánh tráng cuốn",
      instruction:
        "1. Chuẩn bị nguyên liệu và nước sốt. 2. Cuốn nhân vào bánh tráng. 3. Thưởng thức cùng nước mắm.",
      image: "image_url_23",
      introduction:
        "Bánh tráng cuốn là một món ăn vặt phổ biến của người Việt.",
      user: "663f32381868dd5ea67c068f",
    },
    {
      recipe_name: "Bún đậu mắm tôm",
      instruction:
        "1. Nấu nước mắm tôm. 2. Nấu bún, rau sống và đậu. 3. Thưởng thức cùng nước mắm tôm.",
      image: "image_url_24",
      introduction:
        "Bún đậu mắm tôm là một món ăn ngon và đặc trưng của miền Bắc Việt Nam.",
      user: "663f32381868dd5ea67c068f",
    },
    {
      recipe_name: "Phở cuốn",
      instruction:
        "1. Chuẩn bị nguyên liệu và lá bánh tráng. 2. Cuốn thịt và rau vào bánh tráng. 3. Thưởng thức cùng nước mắm.",
      image: "image_url_25",
      introduction:
        "Phở cuốn là một món ăn độc đáo và ngon miệng của người Việt.",
      user: "663f32381868dd5ea67c068f",
    },
    {
      recipe_name: "Bánh mì chảo",
      instruction:
        "1. Chuẩn bị nguyên liệu và chảo nướng. 2. Xào thịt và rau. 3. Sắp xếp lên bánh mì và thưởng thức.",
      image: "image_url_26",
      introduction: "Bánh mì chảo là một món ăn sáng ngon và bổ dưỡng.",
      user: "66407e1b82147d189a686429",
    },
    {
      recipe_name: "Bún đậu mắm tôm",
      instruction:
        "1. Nấu nước mắm tôm. 2. Nấu bún, rau sống và đậu. 3. Thưởng thức cùng nước mắm tôm.",
      image: "image_url_27",
      introduction:
        "Bún đậu mắm tôm là một món ăn ngon và đặc trưng của miền Bắc Việt Nam.",
      user: "66407e1b82147d189a686429",
    },
    {
      recipe_name: "Bún măng vịt",
      instruction:
        "1. Nấu nước dùng từ vịt và măng. 2. Làm bún và chuẩn bị rau sống. 3. Sắp xếp bún, măng và rau lên đĩa.",
      image: "image_url_28",
      introduction:
        "Bún măng vịt là một món ăn ngon và bổ dưỡng của người Việt.",
      user: "66407e2d82147d189a68642a",
    },
    {
      recipe_name: "Cháo lòng",
      instruction:
        "1. Nấu cháo từ lòng và gạo. 2. Chuẩn bị gia vị và rau sống. 3. Thưởng thức cùng bánh mì nóng.",
      image: "image_url_29",
      introduction: "Cháo lòng là một món ăn sáng ngon và bổ dưỡng.",
      user: "66407e2d82147d189a68642a",
    },
    {
      recipe_name: "Gỏi xoài",
      instruction:
        "1. Chuẩn bị nguyên liệu và nước sốt. 2. Thái xoài và rau cải. 3. Trộn đều và thưởng thức.",
      image: "image_url_30",
      introduction: "Gỏi xoài là một món ăn vặt ngon và bổ dưỡng.",
      user: "66407e2d82147d189a68642a",
    },
    {
      recipe_name: "Bún ốc sốt cà",
      instruction:
        "1. Nấu nước dùng từ ốc và cà chua. 2. Nấu bún và chuẩn bị rau sống. 3. Sắp xếp bún, ốc và rau lên đĩa.",
      image: "image_url_31",
      introduction:
        "Bún ốc sốt cà là một món ăn truyền thống của miền Bắc Việt Nam.",
      user: "663f32381868dd5ea67c068f",
    },
    {
      recipe_name: "Cá lóc kho tộ",
      instruction:
        "1. Sơ chế cá lóc và nấu nước mắm. 2. Kho cá lóc với nước mắm, đường và gia vị. 3. Thưởng thức cá lóc kho tộ nóng hổi cùng cơm trắng.",
      image: "image_url_32",
      introduction:
        "Cá lóc kho tộ là một món ăn đặc sản của các vùng miền sông nước.",
      user: "663f32381868dd5ea67c068f",
    },
    {
      recipe_name: "Bánh xèo tôm thịt",
      instruction:
        "1. Chuẩn bị nguyên liệu và làm bột bánh. 2. Chiên bánh xèo và chế biến nhân tôm thịt. 3. Cuốn bánh xèo với rau sống và nước mắm.",
      image: "image_url_33",
      introduction: "Bánh xèo tôm thịt là một món ăn phổ biến và hấp dẫn.",
      user: "663f32381868dd5ea67c068f",
    },

    // Additional recipes for user_id: ObjectId("66407e1b82147d189a686429")
    {
      recipe_name: "Gà nướng muối ớt",
      instruction:
        "1. Làm gia vị và nước chấm. 2. Nướng gà và chế biến muối ớt. 3. Thưởng thức gà nướng cùng nước chấm.",
      image: "image_url_34",
      introduction: "Gà nướng muối ớt là một món ăn nổi tiếng và độc đáo.",
      user: "66407e1b82147d189a686429",
    },
    {
      recipe_name: "Cơm gà xối mỡ",
      instruction:
        "1. Nấu cơm và chuẩn bị gà. 2. Chiên gà và xào mỡ hành. 3. Sắp xếp cơm, gà và mỡ hành lên đĩa.",
      image: "image_url_35",
      introduction: "Cơm gà xối mỡ là một món ăn ngon và bổ dưỡng.",
      user: "66407e1b82147d189a686429",
    },
    {
      recipe_name: "Bánh tráng trộn chua cay",
      instruction:
        "1. Chuẩn bị nguyên liệu và nước chấm. 2. Cắt bánh tráng thành sợi và trộn đều với gia vị. 3. Thêm rau sống và thưởng thức.",
      image: "image_url_36",
      introduction:
        "Bánh tráng trộn chua cay là một món ăn vặt hấp dẫn và lạ miệng.",
      user: "66407e1b82147d189a686429",
    },

    // Additional recipes for user_id: ObjectId("66407e2d82147d189a68642a")
    {
      recipe_name: "Mì Quảng gà",
      instruction:
        "1. Nấu nước dùng từ gà. 2. Làm mì Quảng và chuẩn bị rau sống. 3. Sắp xếp mì, gà và rau lên đĩa.",
      image: "image_url_37",
      introduction:
        "Mì Quảng gà là một món ăn đặc sản của miền Trung Việt Nam.",
      user: "66407e2d82147d189a68642a",
    },
    {
      recipe_name: "Bún mắm nêm",
      instruction:
        "1. Nấu nước mắm nêm. 2. Làm bún và chuẩn bị rau sống. 3. Sắp xếp bún, mắm nêm và rau lên đĩa.",
      image: "image_url_38",
      introduction:
        "Bún mắm nêm là một món ăn ngon và độc đáo của miền Nam Việt Nam.",
      user: "66407e2d82147d189a68642a",
    },
    {
      recipe_name: "Bánh mì bơ tỏi",
      instruction:
        "1. Chuẩn bị nguyên liệu và bánh mì. 2. Phết bơ tỏi lên bánh mì. 3. Nướng bánh mì cho đến khi vàng đều.",
      image: "image_url_39",
      introduction: "Bánh mì bơ tỏi là một món ăn nhẹ và thơm ngon.",
      user: "66407e2d82147d189a68642a",
    },
  ];

  try {
    // Connect to MongoDB
    const client = await connectToDatabase();

    const db = client.db();

    // Access the "recipe" collection
    const recipeCollection = db.collection("recipes");

    // Insert dummy recipes into the collection
    await recipeCollection.insertMany(dummyRecipes);
  } catch (error) {
    console.error("Error adding dummy data:", error);
  }
}

export async function addDummyComments() {
  const client = await connectToDatabase();

  const db = client.db();

  // Access the "recipe" collection
  const commentCollection = db.collection("comments");
  const recipeCollection = await db.collection("recipes").find({}).toArray();

  const dummyComment = {
    user_id: "663f32381868dd5ea67c068f",
    content: "Món này trông ngon quá!",
    created_at: new Date(),
    updated_at: new Date(),
  };

  let commentArray = [];

  for (const recipe of recipeCollection) {
    const dummyComment = {
      recipe_id: recipe._id.toString(),
      user_id: "66407e1b82147d189a686429",
      content: "Món này trông ngon quá!",
      created_at: new Date(),
      updated_at: new Date(),
    };
    commentArray.push(dummyComment);
  }
  commentCollection.insertMany(commentArray);
}
