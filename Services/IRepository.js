 class IRepository {
  getAll() {
    throw new Error("Metoda getAll() nuk është implementuar!");
  }

  getById(id) {
    throw new Error("Metoda getById() nuk është implementuar!");
  }

  add(item) {
    throw new Error("Metoda add() nuk është implementuar!");
  }

  save() {
    throw new Error("Metoda save() nuk është implementuar!");
  }
}

module.exports = IRepository;
