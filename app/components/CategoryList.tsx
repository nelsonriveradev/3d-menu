import CategoriesItem from "./CategoriesItem";

export default function CategoryList() {
  return (
    <div className="flex items-center justify-evenly ">
      <CategoriesItem img="/Icons/icons8-pizza-96.png" name="pizza" />
      <CategoriesItem img="/Icons/icons8-hamburger-96.png" name="hamburger" />
      <CategoriesItem img="/Icons/icons8-pasta-96.png" name="pasta" />
      <CategoriesItem img="/Icons/icons8-cake-96.png" name="Dessert" />
    </div>
  );
}
