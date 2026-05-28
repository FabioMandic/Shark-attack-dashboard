Shark Attack Dashboard
Ovo je interaktivna nadzorna ploča (dashboard) za analizu napada morskih pasa u razdoblju od 1900. do 2018. godine. Projekt je izrađen kako bi na jednostavan i pregledan način prikazao složene skupove podataka učitane direktno iz datoteke attacks.csv.

Napredne funkcionalnosti:

> Kombinacija grafova: Na jednom sučelju spojeni su karta, demografija, stopa fatalnosti i trendovi.
> Vremenska animacija: Opcija pokretanja i pauziranja automatskog prikaza podataka kroz desetljeća.
> Usporedba podataka: Istovremeni prikaz trendova za do 3 odabrane države.

Napredno ponašanje:

> Interaktivnost: Promjenom filtera (npr. godine na klizaču) svi se grafovi automatski prilagođavaju.
> Dinamički UPDATE: Postojeći grafovi se samo ažuriraju (chart.update()), umjesto da se brišu i crtaju ispočetka.
> Tranzicije: Korištene su ugrađene animacije za glatke prijelaze između promjena, bez instantnih preskoka.
