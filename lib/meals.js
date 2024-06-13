import { S3 } from "@aws-sdk/client-s3";

import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";

const s3 = new S3({
  region: "ap-southeast-1",
});

const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
  // generate the slug
  meal.slug = slugify(meal.title, { lower: true });

  // sanitize the instructions
  meal.instructions = xss(meal.instructions);

  // get the extention
  const extension = meal.image.name.split(".").pop();

  // make a new file name
  const fileName = `${meal.slug}.${extension}`;

  // // Create the destination to write our image to
  // const stream = fs.createWriteStream(`public/images/${fileName}`);

  // // save image using stream.write
  const bufferedImage = await meal.image.arrayBuffer();
  // stream.write(Buffer.from(bufferedImage), (error) => {
  //   if (error) {
  //     throw new Error("Saving image failed");
  //   }
  // });

  s3.putObject({
    Bucket: "dungbui1110-nextjs-foodies-image",
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type,
  });

  // when uploading image is done, save the info to the database

  // meal.image = `/images/${fileName}`;
  meal.image = fileName;

  db.prepare(
    `INSERT INTO meals
    (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title,
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug)`
  ).run(meal);
}
