// texts.js — Metin havuzu (ES modülü olarak; file:// ile de sorunsuz çalışır)
// Tamamı küçük harf, noktalama ve paragraf yok — resmî sınav biçimine uygun.
export const METINLER = [
  {
    id: 'adalet-01', kategori: 'resmi', uzunluk: 'orta',
    metin: 'adalet mülkün temelidir ve bir toplumun huzuru ancak hukukun herkese eşit uygulanmasıyla sağlanabilir mahkemeler önünde herkes eşittir hiçbir kimseye ırkı dili dini ya da düşüncesi sebebiyle ayrıcalık tanınamaz zabıt katibi duruşma sırasında söylenenleri eksiksiz ve doğru biçimde kayda geçirmekle görevlidir bu görev büyük bir dikkat ve sorumluluk gerektirir çünkü tutanaklar davanın seyrini belirleyen en önemli belgelerdir',
  },
  {
    id: 'genel-01', kategori: 'genel', uzunluk: 'orta',
    metin: 'insan hayatı boyunca öğrenmeye devam eden bir varlıktır her yeni gün bize daha önce bilmediğimiz şeyleri keşfetme fırsatı sunar okumak düşünmek ve merak etmek zihni açık tutar bir işi iyi yapabilmek için önce o işi sevmek ve ona yeterince zaman ayırmak gerekir sabır ve düzenli çalışma zamanla en zor görünen hedefleri bile ulaşılabilir kılar başarı çoğu zaman yeteneğin değil kararlılığın ürünüdür',
  },
  {
    id: 'doga-01', kategori: 'genel', uzunluk: 'kisa',
    metin: 'doğa insanoğluna sınırsız bir cömertlikle sunulmuş büyük bir emanettir ormanlar denizler ve akarsular yalnızca bugünün değil geleceğin de ortak mirasıdır bu mirası korumak her bireyin görevidir küçük bir fidanı toprakla buluşturmak bile geleceğe atılmış değerli bir adımdır temiz hava ve temiz su olmadan sağlıklı bir yaşam düşünülemez',
  },
  {
    id: 'teknoloji-01', kategori: 'genel', uzunluk: 'orta',
    metin: 'teknoloji günlük yaşamımızın ayrılmaz bir parçası haline gelmiştir haberleşmeden ulaşıma eğitimden sağlığa kadar pek çok alanda işlerimizi kolaylaştırmaktadır ancak bu araçları bilinçli ve ölçülü kullanmak son derece önemlidir ekranlar karşısında geçirilen uzun saatler hem bedeni hem de zihni yorabilir dengeli bir kullanım hem verimliliği artırır hem de sağlığımızı korur bilgiye ulaşmak hiç bu kadar kolay olmamıştı',
  },
  {
    id: 'resmi-02', kategori: 'resmi', uzunluk: 'uzun',
    metin: 'devlet memuru görevini yerine getirirken tarafsızlık dürüstlük ve gizliliğe azami özen göstermek zorundadır kamu hizmeti kişisel çıkarların değil toplumun ortak yararının gözetilmesini gerektirir vatandaşların kuruma olan güveni ancak adil şeffaf ve hesap verebilir bir yönetim anlayışıyla pekişir bir memurun görevini savsaklaması ya da yetkisini kötüye kullanması yalnızca kendisini değil temsil ettiği kurumun itibarını da zedeler bu nedenle her kademedeki görevli üstlendiği sorumluluğun bilincinde olmalı ve işini titizlikle yapmalıdır',
  },
];

export function rastgeleMetin(oncekiId = null) {
  const havuz = METINLER.length > 1 && oncekiId
    ? METINLER.filter(m => m.id !== oncekiId)
    : METINLER;
  return havuz[Math.floor(Math.random() * havuz.length)];
}
