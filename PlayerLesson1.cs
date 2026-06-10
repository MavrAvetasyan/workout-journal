

class Player
{
  
    public int Health;


    public string Name; 


    public int Coins;

    // TODO 4:
   void TakeDamage(int Damage)
    {
        Health -= Damage;
    }
    void Heal(int amount)
    {
        Health += amount;
    }

    bool IsAlive()
    {
       return Health > 0;
    }


}

internal static class PlayerLesson1
{
    public static void Notes()
    {
        Player knight = new Player();
        Player archer = new Player();

        knight.Health = 150;
        knight.Damage = 20;
        knight.Coins = 20;
        knight.Name = "Рыцарь";

        archer.Health = 95;
        archer.Damage = 20;
        archer.Coins = 20;
        archer.Name = "Лучник";

        knight.Health = (int)knight.Health - 45;
        archer.Health = (int)archer.Health - 20;

        Console.WriteLine(knight.Health);
        Console.WriteLine(archer.Health);
    }
}
















// Что важно помнить:
// Player - это класс, то есть чертёж.
// new Player() - создаёт новый объект.
// knight и archer - это два разных объекта.
// У каждого объекта свои значения полей.
// Точка . означает: обратиться к полю или методу внутри объекта.

// Когда будешь готов, можешь раскомментировать код ниже
// и заполнить значения сам.

/*
Player knight = new Player();
Player archer = new Player();

// TODO 7:
// Задай значения для knight:
// Name, Health, Damage, Coins

// TODO 8:
// Задай другие значения для archer:
// Name, Health, Damage, Coins

Console.WriteLine(knight.Health);
Console.WriteLine(archer.Health);

// TODO 9:
// Проверь TakeDamage:
// нанеси урон одному из игроков
// и выведи новое Health

// TODO 10:
// Проверь Heal:
// полечи игрока
// и выведи новое Health

// TODO 11:
// Проверь IsAlive():
// выведи результат в Console.WriteLine(...)
*/
